$(document).ready(function () {

	// Variables
	var holding = [],
		moves,
		disksNum = 3,
		minMoves = 127,
		isResolvingAGame = false,
		$canves = $('#canves'),
		$restart = $canves.find('.button-restart'),
		$solve = $canves.find('.button-solve'),
		$solveLoader = $solve.find('#button-solve-loader'),
		$tower = $canves.find('.tower'),
		$towerA = $canves.find('#tower-a'),
		$towerB = $canves.find('#tower-b'),
		$towerC = $canves.find('#tower-c'),
		$scorePanel = $canves.find('#score-panel'),
		$movesCount = $scorePanel.find('#moves-num'),
		$gameSolution = $canves.find('#game-solution'),
		$solutionContainer = $canves.find('#solution-container'),
		$solutionSteps = $canves.find('#solution-steps'),
		$ratingStars = $scorePanel.find('i'),
		rating = 3;

	//const solveGameURL = 'http://localhost:3000/hanoi';
	const solveGameURL = 'https://hanoi-api.onrender.com/hanoi';

	// Set Rating and final Score
	function setRating(moves) {
		if (moves === minMoves+1) {
			$ratingStars.eq(2).removeClass('fa-star').addClass('fa-star-o');
			rating = 2;
		} else if (moves > minMoves+1 && moves <= minMoves * 1.5) {
			$ratingStars.eq(1).removeClass('fa-star').addClass('fa-star-o');
			rating = 1;
		} else if (moves >= minMoves * 2) {
			$ratingStars.eq(0).removeClass('fa-star').addClass('fa-star-o');
			rating = 0;
		}
		return { score: rating };
	};

	// Init Game
	function initGame(tower) {
		$tower.html('');
		moves = 0;
		$movesCount.html(0);
		holding = [];
		for (var i = 1; i <= disksNum; i++) {
			tower.prepend($('<li class="disk disk-' + i + '" data-value="' + i + '"></li>'));
		}
		$ratingStars.each(function () {
			$(this).removeClass('fa-star-o').addClass('fa-star');
		});
		hideSolution();
	}

	function askForNumberOfDisks() {
		swal({
			allowEscapeKey: false,
			allowOutsideClick: false,
			title: 'Welcome to hanoi tower game',
			text: "Please choose the number of disks you want to play with: ",
			input: 'select',
			inputOptions: {
				tree: '3',
				four: '4',
				five: '5',
				six: '6',
				seven: '7'
			},
			confirmButtonText: 'Start the game'
		}).then(function (result) {
			switch (result) {
				case 'tree': disksNum = 3; break;
				case 'four': disksNum = 4; break;
				case 'five': disksNum = 5; break;
				case 'six': disksNum = 6; break;
				case 'seven': disksNum = 7; break;
				default: break;
			}
			minMoves = Math.pow(2, disksNum) - 1;

			initGame($tower.eq(0));
		});
	}

	// Game Logic
	function countMove(showWinnningMessage) {
		moves++;
		$movesCount.html(moves);

		if (moves > minMoves - 1 && showWinnningMessage) {
			if ($tower.eq(1).children().length === disksNum || $tower.eq(2).children().length === disksNum) {
				swal({
					allowEscapeKey: false,
					allowOutsideClick: false,
					title: 'Congratulations! You Won!',
					text: 'Boom Shaka Lak',
					type: 'success',
					confirmButtonColor: '#8bc34a',
					confirmButtonText: 'Play again!'
				}).then(function (isConfirm) {
					if (isConfirm) {
						askForNumberOfDisks();
					}
				})
			}
		}

		setRating(moves);
	}

	function tower(tower, showWinnningMessage) {
		var $disks = tower.children(),
			$topDisk = tower.find(':last-child'),
			topDiskValue = $topDisk.data('value'),
			$holdingDisk = $canves.find('.hold');

		if ($holdingDisk.length !== 0) {
			if (topDiskValue === holding[0]) {
				$holdingDisk.removeClass('hold');
			} else if (topDiskValue === undefined || topDiskValue > holding[0]) {
				$holdingDisk.remove();
				tower.append($('<li class="disk disk-' + holding[0] + '" data-value="' + holding[0] + '"></li>'));
				countMove(showWinnningMessage);
			}
		} else if ($topDisk.length !== 0) {
			$topDisk.addClass('hold');
			holding[0] = topDiskValue;
		}
	}

	askForNumberOfDisks();

	// Event Handlers
	$canves.on('click', '.tower', function () {
		if (isResolvingAGame == true) { return; }

		var $this = $(this);
		tower($this, true);
	});

	$restart.on('click', function () {
		if (isResolvingAGame == true) { return; }

		swal({
			allowEscapeKey: false,
			allowOutsideClick: false,
			title: 'Are you sure?',
			text: 'Your progress will be Lost!',
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#8bc34a',
			cancelButtonColor: '#e91e63',
			confirmButtonText: 'Yes, Restart Game!'
		}).then(function (isConfirm) {
			if (isConfirm) {
				askForNumberOfDisks();
			}
		})
	});

	$solve.on('click', function () {
		if (isResolvingAGame == true) { return; }

		isResolvingAGame = true;
		initGame($tower.eq(0));
		$solveLoader.css({ 'display': 'inline-block' });

		$.ajax({
			url: solveGameURL,
			method: 'POST',
			data: JSON.stringify({ numberOfDisks: disksNum }),
			contentType: "application/json",
			success: function (response) {
				$solveLoader.css({ 'display': 'none' });
				displaySolutionSteps(response.solutionSteps);
				showSolution();
				animateSolution(response.solutionSteps);
			},
			error: function (xhr, status, error) {
				isResolvingAGame = false;
				$solveLoader.css({ 'display': 'none' });
				swal({
					title: 'Unkown error occurred',
					text: 'An error accourred when fetching solution from server, please try again',
					type: 'error',
				});
			}
		});
	});

	function hideSolution() {
		$gameSolution.css({ 'display': 'none' });
		$solutionContainer.css({ 'display': 'none' });
	}

	function showSolution() {
		$gameSolution.css({ 'display': 'inline-block' });
		$solutionContainer.css({ 'display': 'inline-block' });
	}

	function displaySolutionSteps(steps) {
		$solutionSteps.empty();
		for (let i = 0; i < steps.length; i++) {
			let step = steps[i];
			$solutionSteps.append(
				$('<li>').text('Disk ' + step.disk + ' moved from ' + step.sourceRod + ' to ' + step.targetRod)
			);
		}
	}

	function animateSolution(steps) {
		const pauseInMillis = 400;
		let counterForDelay = 0;
		for (let i = 0; i < steps.length; i++) {
			let step = steps[i];
			let sourceTower = getTowerHTMLItem(step.sourceRod);
			let targetTower = getTowerHTMLItem(step.targetRod);
			setTimeout(() => { tower(sourceTower, false); }, counterForDelay*pauseInMillis);
			counterForDelay++;
			setTimeout(() => { 
				tower(targetTower, false);
				if (i== steps.length-1) {
					isResolvingAGame = false;
				}
			}, counterForDelay*pauseInMillis);
			counterForDelay++;
		}
	}

	function getTowerHTMLItem(towerId) {
		switch(towerId) {
			case "A": return $towerA; break;
			case "B": return $towerB; break;
			case "C": return $towerC; break;
		}
	}
});