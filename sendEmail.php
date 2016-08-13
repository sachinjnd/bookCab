<?php

	$emailId = $_GET["email"];

	$to = $emailId;

	$message = "Time to book an uber!";

	$subject = "Time to book an uber!";
	$replyto = "bookcab@sachingarg.space";

	$headers="";
	$headers = "From: Book Cab <bookcab@sachingarg.space>\n";
	$headers .= "Reply-To: $replyto";
	
	$result = mail($to,$subject,$message,$headers);

?>
