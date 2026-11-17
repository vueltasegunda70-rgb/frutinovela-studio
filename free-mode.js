/* Frutinovela Studio — Fábrica GRATIS local, sin API ni servicios externos */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const stories=[
{title:"El secreto que cambió todo",hook:"Una pista inesperada pone en duda la confianza del grupo.",chapters:[
["La señal","Un objeto aparece donde nadie lo dejó y contiene una pista dirigida a uno de los protagonistas.","¿Quién sabía que yo vendría aquí?","objeto misterioso encontrado en una plaza"],
["La versión imposible","Dos personajes cuentan versiones distintas de un mismo encuentro.","Los dos no pueden estar diciendo la verdad.","discusión frente a una fotografía"],
["El aliado inesperado","Una persona que parecía distante ofrece ayuda, pero pide mantenerlo en secreto.","Te ayudaré, pero no preguntes todavía por qué.","alianza discreta en un café"],
["La verdad escondida","Una segunda prueba demuestra que la primera pista fue colocada para provocar una pelea.","Nos hicieron desconfiar justo cuando más debíamos estar unidos.","descubrimiento de documentos ocultos"],
["La última llamada","Cuando todo parece resuelto, una llamada revela que falta una pieza importante.","Eso que encontraron era solo una copia.","teléfono iluminado en una habitación oscura"]
]},
{title:"Un amor contra todos",hook:"Una relación inesperada despierta celos, dudas y decisiones difíciles.",chapters:[
["El encuentro","Dos personajes se conocen por casualidad y sienten una conexión que ninguno esperaba.","No sé por qué, pero siento que ya te conocía.","encuentro casual en un jardín colorido"],
["Los celos","Un tercero interpreta mal una conversación y decide intervenir.","Si no me cuentas la verdad, la descubriré por mi cuenta.","personaje observando a una pareja a distancia"],
["La promesa","Los protagonistas acuerdan hablar con sinceridad, aunque eso pueda cambiarlo todo.","No quiero promesas bonitas; quiero hechos.","conversación íntima bajo luces cálidas"],
["La separación","Un rumor provoca una ruptura justo antes de una decisión importante.","Me voy porque ya no sé en quién confiar.","despedida emotiva bajo la lluvia"],
["La elección","Una prueba demuestra quién dijo la verdad y los personajes deben decidir si empiezan de nuevo.","Te elijo, pero esta vez sin secretos.","reconciliación al amanecer"]
]},
{title:"La traición del mejor amigo",hook:"Una amistad se rompe cuando desaparece algo que todos necesitaban.",chapters:[
["El acuerdo","El grupo organiza un proyecto y confía una tarea importante a su amigo más cercano.","Esto funciona solo si todos cumplimos nuestra palabra.","grupo de frutas preparando un plan"],
["La desaparición","El objeto principal desaparece y las sospechas recaen sobre quien tenía acceso.","Yo fui el último en tocarlo, pero no lo robé.","caja abierta y personajes sorprendidos"],
["La prueba falsa","Aparece una evidencia que parece definitiva, aunque un detalle no encaja.","Miren la hora: esa imagen no puede ser de ese día.","personaje ampliando una foto como evidencia"],
["La confesión","El responsable admite que ocultó información para proteger a otra persona.","No quería hacer daño; pensé que podía arreglarlo solo.","confesión con expresión de culpa"],
["La consecuencia","El grupo decide qué significa perdonar y qué límites deben establecerse.","Puedo perdonarte, pero tendrás que recuperar nuestra confianza.","conversación de reconciliación en una plaza"]
]},
{title:"El misterio de la fruta perdida",hook:"Una desaparición conecta a todos con un secreto antiguo.",chapters:[
["La ausencia","Una fruta importante no llega a una reunión y deja una nota extraña.","Si recibieron esta nota, significa que ya comenzó.","silla vacía con nota doblada"],
["Las pistas","Los personajes encuentran tres señales que apuntan a lugares diferentes.","Tenemos poco tiempo y demasiadas preguntas.","mapa con tres pistas sobre una mesa"],
["El lugar prohibido","La búsqueda conduce a un sitio que todos evitaban desde hace años.","Prometimos no volver aquí, pero alguien necesita nuestra ayuda.","entrada de un almacén antiguo"],
["El descubrimiento","Detrás de una puerta aparece una grabación que cambia la historia conocida.","Esa voz... pertenece a alguien que está aquí con nosotros.","pantalla antigua reproduciendo una grabación"],
["El regreso","La persona desaparecida vuelve, pero advierte que el verdadero peligro sigue cerca.","Volví por ustedes. Ahora escuchen antes de que sea tarde.","reencuentro dramático en una puerta"]
]},
{title:"La competencia más divertida",hook:"Una competencia amistosa se convierte en una cadena de accidentes y sorpresas.",chapters:[
["El desafío","Los vecinos anuncian una competencia y todos quieren demostrar su talento.","¡Que gane la mejor fruta, y que nadie haga trampas!","plaza decorada para una competencia"],
["El entrenamiento","Cada participante prepara una estrategia muy distinta y exagerada.","Mi plan es perfecto... creo que olvidé una parte.","entrenamiento cómico con accesorios"],
["El accidente","Un error inesperado cambia las reglas y obliga a colaborar.","¡Eso no estaba en el reglamento!","escenario con decoraciones caídas"],
["El equipo","Los rivales descubren que trabajar juntos es más divertido que competir.","Si unimos nuestras ideas, podemos terminar esto.","personajes colaborando entre risas"],
["La sorpresa final","El jurado anuncia un resultado inesperado y todos celebran una victoria compartida.","¡Ganamos todos porque nadie se rindió!","celebración colorida con confeti"]
]}
];
const fruitLooks={
"fresa":"fresa roja con semillas visibles y hojas verdes",
"manzana":"manzana redondeada con pequeño tallo",
"uva":"racimo de uvas moradas o verdes",
"plátano":"plátano amarillo curvado",
"platano":"plátano amarillo curvado",
"banana":"banana amarilla curvada",
"naranja":"naranja redondeada con textura de cáscara",
"limón":"limón amarillo ovalado",
"limon":"limón amarillo ovalado",
"piña":"piña dorada con corona verde",
"pina":"piña dorada con corona verde",
"pera":"pera verde con pequeño tallo",
"mango":"mango ovalado con tonos amarillos y rojizos",
"sandía":"sandía verde con rayas oscuras"
};
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function pick(arr,n){return arr[n%arr.length];}
function makeStory(template,number,idea,genre,cast,seed){
const title=template.title+" — Parte "+number;
const intro=idea||template.hook;
let out="FRUTINOVELA: "+title+"\nGÉNERO: "+genre+"\nPERSONAJES: "+cast.join(", ")+"\nIDEA CENTRAL: "+intro+"\n\n";
const sceneActions=[
"El personaje principal observa la situación, descubre un detalle y decide actuar.",
"El segundo personaje reacciona, cuestiona la explicación y exige una respuesta.",
"Una nueva acción cambia el rumbo y deja una pregunta abierta para la siguiente escena."
];
template.chapters.forEach((ch,ci)=>{
out+="CAPÍTULO "+(ci+1)+" — "+ch[0]+"\n";
for(let si=0;si<3;si++){
const lead=pick(cast,seed+ci+si);
const partner=pick(cast,seed+ci+si+1);
const action=ch[1]+" "+sceneActions[si]+" Contexto de esta historia: "+intro;
const dialogue=si===0?ch[2]:(si===1?("No voy a aceptar esa explicación, "+lead+". Necesito que me cuentes lo que falta."):("Entonces hagamos esto juntos. "+partner+", esta vez no habrá secretos."));
const location=ch[3];
const looks=cast.map(name=>name+": "+(fruitLooks[name.toLowerCase()]||"fruta antropomórfica original con color y silueta constantes")+"; personaje 3D con rostro, ojos, proporciones, vestuario y accesorios idénticos en todas las escenas").join("; ");
const imagePrompt="IMAGEN 3D VERTICAL 9:16. Escena: "+ch[0]+". Lugar: "+location+". Acción: "+action+" Personajes: "+looks+". Protagonista: "+lead+". Emoción coherente con la acción, expresiones legibles, composición cinematográfica, iluminación cuidada y fondo detallado. Mantener el mismo diseño de cada personaje en toda la historia. Sin texto, subtítulos, logos ni marcas de agua.";
const videoPrompt="VIDEO 3D VERTICAL 9:16, 6 a 8 segundos, 24 fps. "+action+" "+lead+" realiza la acción con movimientos naturales y expresión de acuerdo con el diálogo. "+partner+" escucha y reacciona sin mover los labios. Cámara con travelling suave y encuadre estable. Mantener idénticos rostro, color, especie, tamaño, vestuario y accesorios de todos los personajes. Diálogo exacto en español: "+lead+": «"+dialogue+"». Sin deformaciones, duplicaciones, saltos de posición, texto ni marcas de agua.";
out+="ESCENA "+(si+1)+" — "+ch[0]+" / TOMA "+(si+1)+"\nAcción: "+action+"\n"+lead+": "+dialogue+"\nPROMPT DE IMAGEN: "+imagePrompt+"\nPROMPT DE VIDEO: "+videoPrompt+"\n\n";
}
out+="\n";
});
out+="FINAL DE TEMPORADA: "+template.hook+" La historia puede continuar en una nueva temporada.\n";
return {title,text:out};
}
function readProjects(){try{const p=JSON.parse(localStorage.getItem("frutinovelaProjects")||"[]");return Array.isArray(p)?p:[];}catch(e){return[];}}
function saveBatch(items){
const projects=readProjects();
items.forEach(item=>projects.unshift({title:item.title,date:new Date().toISOString(),text:item.text}));
try{localStorage.setItem("frutinovelaProjects",JSON.stringify(projects.slice(0,50)));return true;}catch(e){return false;}
}
function copy(value){
if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(value).then(()=>alert("¡Copiado! Ya puedes pegar el prompt." )).catch(()=>fallbackCopy(value));}
else fallbackCopy(value);
}
function fallbackCopy(value){const t=document.createElement("textarea");t.value=value;t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();let ok=false;try{ok=document.execCommand("copy");}catch(e){}t.remove();alert(ok?"¡Copiado!":"Mantén pulsado el texto, selecciona todo y pulsa Copiar.");}
function render(items){
const root=$("freeResults");root.innerHTML="";
items.forEach((item,i)=>{
const card=document.createElement("div");card.className="scene";
const heading=document.createElement("h3");heading.textContent="🍓 "+item.title;
const summary=document.createElement("p");summary.textContent="Historia creada y guardada automáticamente · 5 capítulos · 15 escenas";
const pre=document.createElement("textarea");pre.value=item.text;pre.rows=8;pre.style.width="100%";pre.style.minHeight="180px";
const copyBtn=document.createElement("button");copyBtn.className="secondary";copyBtn.textContent="📋 Copiar guion completo";copyBtn.addEventListener("click",()=>copy(item.text));
const downloadBtn=document.createElement("button");downloadBtn.className="secondary";downloadBtn.textContent="⬇ Descargar TXT";downloadBtn.addEventListener("click",()=>{const a=document.createElement("a");const url=URL.createObjectURL(new Blob([item.text],{type:"text/plain;charset=utf-8"}));a.href=url;a.download=item.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
card.append(heading,summary,pre,copyBtn,downloadBtn);root.appendChild(card);
});
}
function generateBatch(){
const idea=$("freeIdea").value.trim();
const genre=$("freeGenre").value;
const cast=$("freeCharacters").value.split(",").map(x=>x.trim()).filter(Boolean);
const count=Number($("freeBatch").value)||3;
if(!cast.length){alert("Escribe al menos un personaje.");return;}
const seedBase=Math.floor(Math.random()*100000);
const shuffled=stories.map((s,i)=>({s,k:(seedBase+i*37)%997})).sort((a,b)=>a.k-b.k);
const items=[];
for(let i=0;i<count;i++){
const selected=shuffled[i%shuffled.length].s;
const story=makeStory(selected,i+1,idea,genre,cast,seedBase+i*11);
items.push(story);
}
const saved=saveBatch(items);
render(items);
$("freeStatus").textContent=saved?"¡Listo! Se crearon "+items.length+" frutinovelas y se guardaron en Mis proyectos. Cada una contiene 5 capítulos y 15 escenas.":"Las historias se crearon, pero el almacenamiento está lleno. Descarga los guiones para no perderlos.";
if(typeof window.loadProjects==="function")window.loadProjects();
}
document.addEventListener("DOMContentLoaded",()=>{
const btn=$("freeGenerate");
if(btn)btn.addEventListener("click",generateBatch);
});
})();
