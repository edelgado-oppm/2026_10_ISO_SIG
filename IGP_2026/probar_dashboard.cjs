/* Pruebas de navegador. Uso: node probar_dashboard.cjs carpeta_entrega
   Requiere playwright en el entorno de administración; nunca en los HTML. */
const fs=require('fs'),path=require('path'),assert=require('assert'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(process.argv[2]||'IGP_2026');
const master=path.join(root,'salidas/administracion/Dashboard_IGP_Institucional.html');
const payload=file=>JSON.parse(fs.readFileSync(file,'utf8').match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const data=payload(master);const results=[];
function ok(name){results.push({prueba:name,estado:'OK'});console.log('OK:',name);}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
(async()=>{
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'chrome'});
const ctx=await browser.newContext({offline:true,viewport:{width:1440,height:1100},deviceScaleFactor:1});
const page=await ctx.newPage(),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:|^wss?:/.test(r.url()))requests.push(r.url());});
await page.goto(pathToFileURL(master).href);await page.waitForSelector('#table tbody tr');
assert.equal(await page.evaluate(()=>filtered.length),99);assert.equal(data.records.length,112);ok('file:// con navegador offline: 112 incorporados, 99 SGC iniciales');
assert.deepEqual(await page.evaluate(()=>[filtered.filter(risk).length,filtered.filter(opp).length,filtered.filter(high).length]),[86,13,1]);ok('KPIs SGC sin doble conteo y solo riesgos en alto/crítico');
fs.mkdirSync(path.join(root,'revision_visual'),{recursive:true});await page.screenshot({path:path.join(root,'revision_visual','dashboard_escritorio.png'),fullPage:true});
const high=data.records.find(r=>r.tipo==='RIESGO'&&r.nivel_2026_validado==='Riesgo Alto'&&String(r.eficacia_2026).toLowerCase()==='no');
const inconsistent=data.records.find(r=>r.tipo==='OPORTUNIDAD'&&r.inconsistencia_nivel_2026&&r.aplica_sgc);
const bad=data.records.find(r=>r.resultado_control==='CONTROL INADECUADO'&&r.aplica_sgc);
for(const r of [high,inconsistent,bad]){
assert(r);await page.locator('#search').fill(r.id_registro);await page.getByRole('button',{name:'Ver ficha para auditoría '+r.id_registro,exact:true}).click();
assert.equal(await page.locator('#activities2025 dd').textContent(),r.acciones_2025||'Sin información registrada');
for(const [section,field] of [['D','evaluacion_seguimiento'],['E','resultado_control'],['E','eficacia_2026']])assert((await page.locator('#block'+section).textContent()).includes(String(r[field])));
if(r===high){await page.screenshot({path:path.join(root,'revision_visual','ficha_riesgo_alto.png'),fullPage:true});await page.pdf({path:path.join(root,'revision_visual','Ficha_ejemplo_impresion.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});}
await page.getByRole('button',{name:'← Volver al listado',exact:true}).click();assert.equal(await page.locator('#search').inputValue(),r.id_registro);ok('Ficha real '+r.id_registro+': texto íntegro, evaluaciones separadas y retorno con filtros');}
await page.locator('#reset').click();await page.locator('#search').fill('tecnologias');assert(await page.evaluate(()=>filtered.length)>0);assert(await page.evaluate(()=>filtered.every(r=>norm(r.proceso+' '+r.descripcion+' '+r.acciones_2025+' '+r.organo_unidad_organica+' '+r.id_registro).includes('tecnologias'))));ok('Búsqueda insensible a tildes');
await page.locator('#reset').click();await page.locator('#universe').selectOption('all');assert.equal(await page.evaluate(()=>filtered.length),112);await page.locator('#reset').click();
await page.evaluate(()=>facets.proceso.d.open=true);await page.getByLabel('Buscar Proceso',{exact:true}).fill('Comunicaciones');
await page.locator('#mainFilters .facet').filter({has:page.locator('summary b',{hasText:/^Proceso$/})}).getByRole('checkbox').filter({visible:true}).first().check();
assert(await page.evaluate(()=>new Set(filtered.map(r=>r.proceso)).size===1));ok('Filtro por proceso aplica a la base única de indicadores, gráficos y tabla');
await page.locator('#reset').click();await page.evaluate(()=>{facets.tipo.d.open=true;});await page.locator('#mainFilters .facet').first().getByRole('checkbox').first().check();await page.evaluate(()=>facets.tipo.d.open=true);await page.locator('#mainFilters .facet').first().getByRole('checkbox').nth(1).check();assert.equal(await page.evaluate(()=>filtered.length),99);ok('Multiselección OR dentro de una dimensión');
await page.locator('#reset').click();await page.getByRole('button',{name:'Riesgos altos / críticos',exact:false}).click();assert.equal(await page.evaluate(()=>filtered.length),1);assert.equal(await page.evaluate(()=>filtered[0].id_registro),high.id_registro);ok('KPI clicable excluye oportunidades inconsistentes');
const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const csv=fs.readFileSync(await download.path(),'utf8');assert(csv.includes(high.id_registro));assert(!csv.includes(inconsistent.id_registro));ok('CSV limitado al subconjunto filtrado');
await page.locator('#reset').click();await page.locator('#search').fill('no-existe-xyz');assert(await page.locator('#empty').isVisible());assert.equal(await page.evaluate(()=>filtered.length),0);ok('Conjunto vacío sin indicadores residuales');
await page.locator('#reset').click();await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));await page.screenshot({path:path.join(root,'revision_visual','dashboard_movil.png'),fullPage:true});ok('Diseño móvil sin desbordamiento horizontal de página');
await page.setViewportSize({width:1440,height:1100});
const processFiles=files(path.join(root,'salidas/auditados')).filter(f=>f.endsWith('.html'));
assert.equal(processFiles.length,17);
for(const file of processFiles){const d=payload(file),expected=data.records.filter(r=>r.proceso===d.meta.ambito);assert.deepEqual(d.records,expected);const ids=new Set(expected.map(r=>r.id_registro));assert(d.actions.every(a=>ids.has(a.id_registro)));assert(d.validations.every(a=>ids.has(a.id_registro)));assert.deepEqual(d.actions,data.actions.filter(a=>ids.has(a.id_registro)));assert.deepEqual(d.validations,data.validations.filter(a=>ids.has(a.id_registro)));const raw=fs.readFileSync(file,'utf8');for(const r of data.records.filter(r=>!ids.has(r.id_registro)))assert(!raw.includes('"'+r.id_registro+'"'));await page.goto(pathToFileURL(file).href);assert.equal(await page.evaluate(()=>R.length),expected.length);assert.equal(await page.evaluate(()=>filtered.length),expected.filter(r=>r.aplica_sgc).length);}
ok('17 archivos por proceso: IDs, textos y relaciones exactos; sin IDs ajenos en HTML');
assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(requests.length,0,JSON.stringify(requests));ok('Cero errores JavaScript y cero solicitudes de red en apertura e interacción offline');
await browser.close();fs.writeFileSync(path.join(root,'PRUEBAS_NAVEGADOR.json'),JSON.stringify({fecha:new Date().toISOString(),modo:'Chrome headless, file://, offline:true',resultados:results,errores:errors,solicitudes_red:requests},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
