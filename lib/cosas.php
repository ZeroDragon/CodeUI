<?php
getOldies();
$bloqueadas = array('shared','clase1','clase2');
if (isset($_POST)){
	switch ($_POST['action']){
		case 'traegaleria':
			echo traeGaleria();
			break;
		case 'subidera':
			echo subeArchivo();
			break;
		case 'borrado':
			echo borraArchivo();
			break;
		default:
			echo $_POST['action'];
	}
}

function borraArchivo(){
	global $bloqueadas;
	if(in_array($_POST['cual'], $bloqueadas)) return 'Bloqueado';
	$path = '../public/'.$_POST['cual'].'/'.$_POST['file'];
	unlink($path);
	return 'Archivo Borrado';
}

function borraRecursivo($directory, $empty=FALSE){
	if(substr($directory,-1) == '/') $directory = substr($directory,0,-1);
	if(!file_exists($directory) || !is_dir($directory)){
		return FALSE;
	}elseif(!is_readable($directory)){
		return FALSE;
	}else{
		$handle = opendir($directory);
		while (FALSE !== ($item = readdir($handle))){
			if($item != '.' && $item != '..'){
				$path = $directory.'/'.$item;
				if(is_dir($path)){
					borraRecursivo($path);
				}else{
					unlink($path);
				}
			}
		}
		closedir($handle);
		if($empty == FALSE && !rmdir($directory)) return FALSE;
		return TRUE;
	}
}

function getOldies(){
	if ($handle = opendir('../public/')) {
    while (false !== ($entry = readdir($handle))) {
      if ($entry[0]!='.') {
      	clearstatcache();
      	$dir = '../public/'.$entry;
      	$segundos = time() - filemtime($dir);
      	//echo $segundos;
      	if($segundos >= 86400) borraRecursivo($dir);
      }
    }
    closedir($handle);
	}
}

function creaDir($dir){
	if(!is_dir($dir)){
		mkdir($dir, 0777);
		chmod($dir, 0777);
	}
	return $dir;
}

function subeArchivo(){
	global $bloqueadas;
	$permitidos = array('png','jpg','bmp','jpeg','gif');
	$ext = strtolower( array_pop(explode('.', $_FILES['elarchivo']['name'])) );
	if(!in_array($ext, $permitidos)) return 'No permitido';
	if(in_array($_POST['cual'], $bloqueadas)) return 'Bloqueado';
	$dir = '../public/'.$_POST['cual'].'/';
	$target_path = creaDir($dir);
	$target_path = $target_path . basename( $_FILES['elarchivo']['name']); 
	move_uploaded_file($_FILES['elarchivo']['tmp_name'], $target_path);
	return 'Archivo Subido';
}

function traeGaleria(){
	$files = array();
	$dir = '../public/'.$_POST['cual'].'/';
	if (is_dir($dir) && $handle = opendir($dir)) {
    while (false !== ($entry = readdir($handle))) {
        if ($entry[0]!='.') {
            $files[] = array(str_replace(' ','_',$entry),rawurlencode($entry));
        }
    }
    closedir($handle);
	}
	$dir = creaDir($dir);
	return json_encode($files);
}
?>