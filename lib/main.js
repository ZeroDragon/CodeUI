var myCodeJava = CodeMirror(function(elt){
  javatext.parentNode.replaceChild(elt, javatext);
},
{
	value:javatext.value,
	mode:'javascript',
	tabSize:2,
	indentWithTabs:true,
	lineNumbers:true
});

var myCodeCSS = CodeMirror(function(elt){
  csstext.parentNode.replaceChild(elt, csstext);
},
{
	value:csstext.value,
	mode:'css',
	tabSize:2,
	indentWithTabs:true,
	lineNumbers:true
});

var myCodeHead = CodeMirror(function(elt){
  headtext.parentNode.replaceChild(elt, headtext);
},
{
	value:headtext.value,
	mode:'xml',
	htmlMode:true,
	tabSize:2,
	indentWithTabs:true,
	lineNumbers:true
});

var myCodeBody = CodeMirror(function(elt){
  bodytext.parentNode.replaceChild(elt, bodytext);
},
{
	value:bodytext.value,
	mode:'xml',
	htmlMode:true,
	tabSize:2,
	indentWithTabs:true,
	lineNumbers:true
});

var myCodeTODO = CodeMirror(function(elt){
  todotext.parentNode.replaceChild(elt, todotext);
},
{
	value:todotext.value,
	mode:'text/html',
	tabSize:2,
	indentWithTabs:true,
	lineNumbers:true,
	readOnly:true,
	onChange: function() {
		clearTimeout(delay);
		delay = setTimeout(updatePreview2,30);
  }
});
function downloadTodo(){
	//console.log(window.btoa(myCodeTODO.getValue()));
	$('#downloadFile').attr({
		href:'data:text/html;charset=utf-8;base64,'+window.btoa(myCodeTODO.getValue())
	});
	//data:application/octet-stream;charset=utf-8;base64,
}
var delay;
function getAlltheCodez(){
	//get all the codes!
	head = myCodeHead.getValue();
	body = myCodeBody.getValue();
	css = myCodeCSS.getValue();
	jav = '\n<script>\n'+myCodeJava.getValue()+'\n<\/script>';
	return value = '<html>\n<head>\n'+head+'\n</head>\n<body>\n'+body+'\n<style>\n'+css+'\n</style>'+jav+'\n</body>\n</html>';
}
function updatePreview(){
	clearTimeout(delay);
	myCodeTODO.setValue(getAlltheCodez());
}
function updatePreview2(){
	clearTimeout(delay);
  var previewFrame = document.getElementById('eliframe');
  var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
  preview.open();
  preview.write(myCodeTODO.getValue());
  preview.close();
  downloadTodo();
  autosave(JSON.parse(sessionStorage.codeUI).autosave);
}
var files = {};
var galeria = {};
function getsavedFiles(){
	$('#lesavedFiles').html('<b>Archivos Guardados</b>');
	if(localStorage.codeUI==undefined) localStorage.codeUI = '{}';
	codeUI = JSON.parse(localStorage.codeUI);
	if(codeUI.files==undefined) codeUI.files = {};
	files = codeUI.files;
	//console.log(files);
	$.each(files, function(index,value){
		$('#lesavedFiles').append(
			$('<div/>',{
				class:'carga_archivo',
				id:'archivo_'+index,
				style:'border-bottom:1px solid #000;padding-bottom:2px;'
			}).append(
				index.split('_').join(' '),
				$('<span/>',{
					style:'float:right'
				}).append(
					$('<a/>',{
						href:'javascript:;',
						style:'text-decoration:none;',
						onclick:'cargarsaved("archivo_'+index+'")'
					}).append(
						'[cargar]'
					),
					' | ',
					$('<a/>',{
						href:'javascript:;',
						style:'text-decoration:none;',
						onclick:'removesaved("archivo_'+index+'")'
					}).append(
						'[eliminar]'
					)
				)
			)
		);
	});
	getImagenes();
}
function getImagenes(){
	if(codeUI.username==undefined) codeUI.username = 'shared';
	$('#leUsername').text(codeUI.username);
	$('#legaleria').html('<div id="innerlegaleria"></div>');
	$.post('lib/cosas.php',{
		action:'traegaleria',
		cual:codeUI.username
	},function(data){
		archivos = JSON.parse(data);
		pixeles = (archivos.length*120)+20;
		$('#innerlegaleria').css({width:pixeles+'px'});
		for (var i = 0; i < archivos.length; i++) {
			elfile = 'public/'+codeUI.username+'/'+archivos[i][1];
			$('#innerlegaleria').append(
				$('<div/>',{
					class:'thumb',
					style:'background-image:url('+elfile+')'
				}).append(
					$('<div/>',{class:"hCopy",file:archivos[i][1]}).append('Usar'),
					$('<div/>',{class:"hDele",file:archivos[i][1]}).append('Borrar')
				)
			);
		};
	})
}
function removesaved(cual){
	levar = confirm('Esta seguro?');
	if (!levar) return;
	autosave(false);
	elcual = cual.split('_');
	elcual.shift();
	elcual = elcual.join('_');
	delete codeUI.files[elcual];
	localStorage.codeUI = JSON.stringify(codeUI);
	getsavedFiles();
}
function cargarsaved(cual){
	elcual = cual.split('_');
	elcual.shift();
	elcual = elcual.join('_');
	selected = codeUI.files[elcual]
	myCodeHead.setValue(window.atob(selected.head));
	myCodeBody.setValue(window.atob(selected.body));
	myCodeCSS.setValue(window.atob(selected.css));
	myCodeJava.setValue(window.atob(selected.jav));
	updatePreview();
	autosave(elcual);
}
function getarrayCodez(){
	return {
		head : window.btoa(myCodeHead.getValue()),
		body : window.btoa(myCodeBody.getValue()),
		css : window.btoa(myCodeCSS.getValue()),
		jav : window.btoa(myCodeJava.getValue())
	};
}
function saveFile(){
	nombre = prompt('Escriba un nombre para el archivo');
	nombre = nombre.split(' ').join('_');
	files[nombre] = getarrayCodez();
	localStorage.codeUI = JSON.stringify(codeUI);
	getsavedFiles();
	autosave(nombre);
}
function autosave(cual){
	$('#statusAG').text('No');
	codeUI2 = {autosave:cual}
	if(sessionStorage.codeUI==undefined) sessionStorage.codeUI = JSON.stringify(codeUI2);
	oldcodeUI = JSON.parse(sessionStorage.codeUI);
	sessionStorage.codeUI = JSON.stringify(codeUI2); //true, cambiamos el autosave y seguimos
	if(!cual) return;
	files[cual] = getarrayCodez();
	localStorage.codeUI = JSON.stringify(codeUI);
	if(cual) $('#statusAG').text(codeUI2.autosave.split('_').join(' '));
}
function copy( file ){
	text = 'public/'+codeUI.username+'/'+file;
  var input = $('<input>',{type:'text',id:'copytext'}).appendTo('#lecopytext');
  $('#lecopytext').append('<=Copiame!');
  input.val(text);
  input.focus();
  input.select();
}
function elim( file ){
	if(!confirm('Confirme borrado de archivo.')) return;
	$.post('lib/cosas.php',{
		action:'borrado',
		cual:codeUI.username,
		file:file
	},
	function(data){
		getImagenes();
	});
}

$(document).ready(function(){
	$('.codetext').hide();
	$('#descargar2').show();
	myCodeTODO.setValue(getAlltheCodez());
	getsavedFiles();
	autosave(false);
});

$('#lecopytext').live('blur',function(){
	$(this).html('');
});

$('.hCopy').live('click',function(){
	copy($(this).attr('file'));
});

$('.hDele').live('click',function(){
	elim($(this).attr('file'));
});

$('.titulo').click(function(){
	elid = $(this).attr('id').split('t-')[1];
	if($('#'+elid).is(":visible")) return;
	$('.codetext').hide('fast');
	$('#'+elid).toggle('fast');
	myCodeTODO.setValue(getAlltheCodez());
	myCodeCSS.setValue(myCodeCSS.getValue());
	myCodeBody.setValue(myCodeBody.getValue());
	myCodeHead.setValue(myCodeHead.getValue());
	myCodeJava.setValue(myCodeJava.getValue());
});

$('#leUsername').click(function(){
	username = prompt('Escoja un Username');
	username = username.replace(' ','_');
	codeUI.username = username
	localStorage.codeUI = JSON.stringify(codeUI);
	getImagenes();
})

$("#formsubmit").click(function () {
		$('#postiframe').remove();
    var iframe = $('<iframe name="postiframe" id="postiframe" style="display: none" />');
    $("body").append(iframe);
    var form = $('#subirarchivos');
    form.attr("action", "lib/cosas.php");
    form.attr("method", "post");
    form.attr("enctype", "multipart/form-data");
    form.attr("encoding", "multipart/form-data");
    form.attr("target", "postiframe");
    form.attr("file", $('#userfile').val());
    $('#cualSubidera').val(codeUI.username);
    form.submit();
    $("#postiframe").load(function () {
    	//console.log($("#postiframe")[0].contentDocument.body.innerHTML);
    	getImagenes();
    	$('#subirarchivos')[0].reset();
    });
    return false;
});