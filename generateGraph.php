<?php
error_reporting(E_ALL); ini_set('display_errors', 1);

$filename = $_GET['file'];
file_put_contents('graphs/'.$filename, file_get_contents('php://input'));
shell_exec('python dot-tm.py graphs/'.$filename);

if($_GET['style']=='static'){
	$imagedata = file_get_contents('graphs/'.$filename.'.png');
    $base64 = base64_encode($imagedata);
	echo $base64;
}

if($_GET['style']=='interactive'){
	echo file_get_contents('graphs/'.$filename.'.dot');
}

?>
