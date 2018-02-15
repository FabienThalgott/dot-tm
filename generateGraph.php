<?php
$filename = $_GET['file'];
file_put_contents($filename, file_get_contents('php://input'));
shell_exec('python dot-tm.py '.$filename);
echo file_get_contents($filename.'.dot');
unlink($filename);
?>
