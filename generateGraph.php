<?php
error_reporting(E_ALL); ini_set('display_errors', 1);

$filename = $_GET['file'];
if(preg_match('/^[a-z0-9-]+$/', $filename)) {
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
 
	if($_GET['style']=='zip'){
		$file = 'graphs/'.$filename.'.zip';
        $zip = new ZipArchive;
        if ($zip->open($file, ZipArchive::CREATE) === TRUE)
        {
        $zip->addFile('graphs/'.$filename.'.png','tm.png');
        $zip->addFile('graphs/'.$filename.'.dot','tm.dot');
        $zip->addFile('graphs/'.$filename,'tm.json');
        $zip->addFile('graphs/'.$filename.'.csv','tm.csv');
		$zip->close();
        }
    
}

} else {
echo "Nah, that won't work";
}
?>
