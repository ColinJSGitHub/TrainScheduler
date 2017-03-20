var config = {
  	apiKey: "AIzaSyCkMwZk74BvCLUbnx6OXwVuzl6FuUvDuq4",
    authDomain: "colintrainscheduler.firebaseapp.com",
    databaseURL: "https://colintrainscheduler.firebaseio.com",
    storageBucket: "colintrainscheduler.appspot.com",
    messagingSenderId: "240267255891"
  };
firebase.initializeApp(config);

// Shortcuts to the database
var dbRef = firebase.database().ref()
 ,dbRefTrains = dbRef.child('custom_schedule');

$('#reset').on('click', function(){
	// Function to clear the firebase database and clear the TR sections

	dbRef.remove();

	// Clears the section created by the submit/add train buttons
	$('tbody').empty();
		
});


$('#submit').on('click', function(){
	// create user input var's and assign default values
	// to use agaist data validation check
	var $trainNameInput = ''
		,$destinationInput = ''
		,$firstTrainTimeInput = ''
		,$frequencyInput = ''

	// All of the user input gets stored into variables
	$trainNameInput = $('#trainNameInput').val().trim();
	$destinationInput = $('#destinationInput').val().trim();
	$firstTrainTimeInput = $('#firstTrainTimeInput').val().trim();
	$frequencyInput = $('#frequencyInput').val().trim();
	// calculations to get the next train time and minutes until next rain
	firstTrainTimeConverted = moment($firstTrainTimeInput, "hh:mm").subtract(1, "years");
    currentTime = moment();
    differenceTime = moment().diff(moment(firstTrainTimeConverted), "minutes");
    timeRemainder = differenceTime % $frequencyInput;
    $minutesTilNextTrain = $frequencyInput - timeRemainder;
    nextTrainTime = moment().add($minutesTilNextTrain, "minutes");
    $nextTrainTimeFormatted = moment(nextTrainTime).format("hh:mm");

	if(
		// Input validation: ensures that the user actually filled out the various inputs. 

		$trainNameInput === ''
		|| $destinationInput === ''
		|| $firstTrainTimeInput === ''
		|| $frequencyInput === ''
	){
		// sets the 'failModal' ID to show in the event that you did not populate all of the inputs
		$('#failModal').modal('show');

	// In the event that you pass input validation, perform the else function. Pushes all of these values to firebase
	}else{
		dbRefTrains.push({
			trainName: $trainNameInput
			,destination: $destinationInput
			,frequency: $frequencyInput	
			,firstTrainTime: $firstTrainTimeInput
			,minutesTilNextTrain: $minutesTilNextTrain
			,nextTrainTimeFormatted: $nextTrainTimeFormatted
		});

		// Sends the success Modal if you were able to successfully add the train.
		$('#successModal').modal('show');


		// Catches the new user input in the database then writes it into the html page.
		dbRefTrains.once('child_added').then(function(snap){

			// create variable that calculates the time arriving at the station

			$('tbody').append(
			'<tr>'
				+'<td class="col-xs-3">' + snap.val().trainName + '</td>'
				+'<td class="col-xs-2">' + snap.val().destination + '</td>'
				+'<td class="col-xs-2">' + snap.val().frequency + '</td>'
				+'<td class="col-xs-2">' + snap.val().nextTrainTimeFormatted + '</td>' // insert nextTrainTime variable
				+'<td class="col-xs-2">' + snap.val().minutesTilNextTrain + '</td>' // insert Minutes from Station variable
				+'<td class="col-xs-1">' + '<input type="submit" value="Remove train" class="remove-train btn btn-primary btn-sm">' + '</td>'
			+'<tr>');
		});
	}
});


// button for removing individual trains
$("body").on("click", ".remove-train", function(){
     $(this).closest ('tr').remove();
     getKey = $(this).parent().parent().attr('id');
     dbRefTrains.child(getKey).remove();
});

