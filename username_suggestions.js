  // Constant var used as dictionary
  const CHGLIB = ["chegg", "chg", "ch", "egg"]
  
  // TODO: use utility lib instead of having to extend Array class
  Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
	};
  
  // check username input for groups to use as key phrases and check availablity
  function suggestNames(username) {
    // If there are any groups of non-digit characters, use that as a key phrase, otherwise check
    // for groups of numbers. From Hillary2016 we can have two key phrases ["hillary", "2016"].
		var wordMatch = username.match(/[a-zA-Z]+/),
    		numberMatch = username.match(/\d+/),
       	suggestions = [];
        
    	if (wordMatch) {
        for (var i = 0; i < CHGLIB.length; i++) {
          suggestion1 = CHGLIB[i] + wordMatch + Math.floor((Math.random() * 9999) + 1000);
          suggestion2 = wordMatch + CHGLIB[i] + Math.floor((Math.random() * 9999) + 1000);
					suggestions.push(suggestion1, suggestion2);
        }
      }
      
      if (numberMatch) {
        for (var i = 0; i < CHGLIB.length; i++) {
          suggestion1 = CHGLIB[i] + numberMatch + numberMatch;
          suggestion2 = numberMatch + CHGLIB[i] + Math.floor((Math.random() * 9999) + 1000);
					suggestions.push(suggestion1, suggestion2);
        }
      }
      
      // now check all the suggestions availability
      var params = suggestions.join(",");
      checkAvail(params, function(response) {
      	var taken = [];
      	if (!$.isEmptyObject(response) && response.length != 0) {
          // go thru response and make array of usernames
          for (var i = 0; i < response.length; i++) {
          	taken.push(response[i].username);
          }
          // compare what we know is taken from our list of suggestions
          var available = suggestions.diff(taken);
          if (available.length > 2) { // we want at least 3 here
          	chgAlert("That username is not available. How about one of these:" + available[0] + "," + available[1] + "," + available[2], "error");
            return;
          }
          
          // if we don't have enough to make 3 suggestions, do it again
          if (available.length < 3) {
          	suggestions = [];
          	suggestNames(username);
          }
          
          return;
        }
        
        chgAlert("That username is not available. How about one of these:" + suggestions[0] + "," + suggestions[1] + "," + suggestions[2], "error");
      });
  }
  
  function chgAlert(text, color) {
  	var alertText = $("#chg-alert-text");

		// Remove any existing class & update color and text
    alertText.removeClass().addClass(color).text(text);
  }
  
  // Given a username will return array of user objects to callback function
  function checkAvail(username, callback) {
    	$.ajax({
      	url: '/coding-challenge/api/user/',
        type: 'get',
        data: {
        	username: username
        }
      })
      .done(function(response) {
      	callback(response);
      })
      .fail(function(){
      	chgAlert('Sorry, there seems to be a problem on our side. Please try again.', "error");
      })
  }

	// Event delegation
  $("#chg-balloon-submit").click(function(event) {
  	var input = $('#chg-balloon-input').val(),
    		regex = new RegExp('[^a-zA-Z0-9]'); // Matches on special characters
        
    // Catch special characters    
    if (regex.test(input)) {
    	chgAlert("Your password cannot contain special characters!", "error");
      return;
    }    
    
    // Catch empty submission
    if (!input) {
      chgAlert("Please enter a username to check", "info");
      return;
		};
    
    checkAvail(input, function(response){
        // If response is not empty, there is an existing record.
        if (!$.isEmptyObject(response) && response.length != 0) {
          suggestNames(input);
          return;
        }
        chgAlert("Congrats! " + input + " is available.", "success");
      });

  });
        
