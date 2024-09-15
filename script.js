// Alert box using SweetAlert2 - https://limonte.github.io/sweetalert2
$(document).ready(function () {

	// Variables
	var holding = [],
		moves,
		disksNum = 3,
		minMoves = 127,
		$canves = $('#canves'),
		$restart = $canves.find('.restart'),
		$tower = $canves.find('.tower'),
		$scorePanel = $canves.find('#score-panel'),
		$movesCount = $scorePanel.find('#moves-num'),
		$ratingStars = $scorePanel.find('i'),
		rating = 3;

	// Set Rating and final Score
	function setRating(moves) {
		if (moves === minMoves) {
			$ratingStars.eq(2).removeClass('fa-star').addClass('fa-star-o');
			rating = 2;
		} else if (moves > minMoves && moves <= minMoves * 1.5) {
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
	}

	function askForNumberOfDisks() {
		const numberOfDisks = swal({
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
	function countMove() {
		moves++;
		$movesCount.html(moves);

		if (moves > minMoves - 1) {
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

	function tower(tower) {
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
				countMove();
			}
		} else if ($topDisk.length !== 0) {
			$topDisk.addClass('hold');
			holding[0] = topDiskValue;
		}
	}

	askForNumberOfDisks();

	// Event Handlers
	$canves.on('click', '.tower', function () {
		var $this = $(this);
		tower($this);
	});

	$restart.on('click', function () {
		swal({
			allowEscapeKey: false,
			allowOutsideClick: false,
			title: 'Are you sure?',
			text: "Your progress will be Lost!",
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
});