<!DOCTYPE html>
<html lang="ru">
<head>
	<title>Photo 360</title>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
	<script src="./web/js/control.js"></script>
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
	<link rel="stylesheet" href="./web/css/style.css">
</head>
<body>
	<section class="wrapper-wide">
		<div id="container">
			<div class="container">
				<div id="content">
					<div class="row">
						<div class="col-sm-4">
							<div class="device device-arduino">
								<div class="icon">
									<img src="./web/image/arduino.jpg"/>
								</div>
								<div class="status"></div>
							</div>
						</div>
						<div class="col-sm-4">
							<div class="session-config form-horizontal">
								<div class="panel-body">
								<div class="form-group">
									<label class="col-sm-6 control-label">Количество фото</label>
									<div class="col-sm-6">
										<input type="number" step="1" value="38" min="1" max="100" class="form-control" id="input-photo-count">
									</div>
								</div>
								<div class="form-group">
									<progress class="progress" value="0" max="100">
									</progress>
								</div>
								<div class="form-group">
									<div class="col-sm-12">
										<button type="button" class="btn-primary btn start" disabled onclick="control.start()">Начать</button>
									</div>
								</div>
								</div>
							</div>
						</div>
						<div class="col-sm-4">
							<div class="device device-camera">
								<div class="icon">
									<img src="./web/image/camera.jpg"/>
								</div>
								<div class="status"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
	<script>
		control.init();
	</script>
</body>
</html>