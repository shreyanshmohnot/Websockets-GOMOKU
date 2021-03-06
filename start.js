var usr = 1; // means black color
var chance = true;

// inintalize whole board
var gameboard = [];

for (var i=0; i<19; i++) {
	gameboard[i] = [];
	for (var j=0; j<19; j++) {
		gameboard[i][j] = 0;
	}
}

window.onload = function() {
    var canvas = document.getElementById("gameboard");
	var context = canvas.getContext('2d');	
    var connection = new WebSocket('ws://45.55.184.240:80');
    	
    connection.onopen = function () {
        connection.send(JSON.stringify({type: 'ClientConnect'}));
        initalize_area();
        document.getElementById("status").innerHTML = "Black Stones. You play first.";
        document.getElementById("stones").innerHTML = "BLACK";
    };

    connection.onerror = function (error) {
        console.log('WebSocket Error ' + error);
    };

    connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
		} catch (e) {
            return;
        }

        if (json.type == 'gameboard-index' ) {
            var i = json.data1;
			var j = json.data2;
			var color = json.color;
			gameboard[i][j] = json.color;
			drawnodes(i, j, color);
			if(json.color != usr) {
				chance = true;
				document.getElementById("status").innerHTML = "Your turn.";
			}
        } else {
        	if (json.type == 'second-client') {
        		document.getElementById("status").innerHTML = "White Stones. You play second.";
        		document.getElementById("stones").innerHTML = "WHITE";
        		usr = -usr;
        		chance = false;
        	}
        	else {
        		if(json.type == 'winner') {
        			document.getElementById("status").style.color = "#C2185B";
        			var i = json.data1;
					var j = json.data2;
					var color = json.color;
					gameboard[i][j] = json.color;
					drawnodes(i, j, color);
        			if(json.color == 1) {
        				document.getElementById("status").innerHTML = "Black stones player wins";	
        			}
        			else {
        				document.getElementById("status").innerHTML = "White stones player wins";
        			}
        			disableScreen();
        		}
        		else {
		        	if (json.type === 'history') {
		        		for (var i = 0; i < json.data.length; i++) {
		        			for (var k = 0; k < json.data[i].length; k++) {
		            			var ro = json.data[i][k].data1;
		            			var co = json.data[i][k].data2;
		            			gameboard[ro][co] = json.data[i][k].color;
								drawnodes(json.data[i][k].data1, json.data[i][k].data2, json.data[i][k].color);
							}
						}
		        	}
		    		else {
		    			if(json.type == 'more-clients') {
		    				document.getElementById("more-client").innerHTML = "Just Watch..";
		    				document.getElementById("status").style.color = "white";
		    				document.getElementById("stones").style.color = "white";
		    				disableScreen();
		    			}
		    			else {
		    				if(json.type == 'chance'){
		    					chance = true;
		    				}
		    				else{
		    					if(json.type == 'close-win') {
		    						if(json.color == 0) {
				        				document.getElementById("status").style.color = "#C2185B";
				        				document.getElementById("status").innerHTML = "White stones player wins";
				        				disableScreen();
				        			}
				        			if(json.color == 1) {
				        				document.getElementById("status").style.color = "#C2185B";
		    							document.getElementById("status").innerHTML = "Black stones player wins";
				        				disableScreen();
				        			}
		    					}
		    					else
		    						console.log('Hmm..., I\'ve never seen JSON like this: ', json);
		    				}
		    			}
		            }
		        }
        	}
        }
    };

    function disableScreen() {
	    var div= document.createElement("div");
	    div.className += "overlay";
	    document.body.appendChild(div);
	}

    function initalize_area() {
		for(var i=0; i<19; i++) {
			horizontaldraw(i);
			verticaldraw(i);
			context.strokeStyle = "#6D6E70";
			context.stroke();
		}
	}

	function horizontaldraw(i) {
		context.moveTo(20 + 40 * i, 20);
		context.lineTo(20 + 40 * i, 740);
	}


	function verticaldraw(i) {
		context.moveTo(20, 20 + 40 * i);
		context.lineTo(740, 20 + 40 * i);
	}

	function drawnodes(i, j, user) {
		var canvas = document.getElementById('gameboard');
		var context = canvas.getContext('2d');
		context.beginPath();
		context.arc(20 + 40 * i, 20 + 40 * j, 10, 0, 2 * Math.PI);
		context.closePath();
		var gradient = context.createRadialGradient(20 + 40 * i, 20 + 40 * j, 0, 20 + 40 * i, 20 + 40 * j, 12)
		if (user == 1) {
			gradient.addColorStop(0, "#4764AE");
			gradient.addColorStop(1, "#4764AE");
		} else {
			gradient.addColorStop(0, "#11BE31");
			gradient.addColorStop(1, "#11BE31");
		}
		context.fillStyle = gradient;
		context.fill();
	}

	canvas.onclick = function(event) {
		if(!chance) {return;} // when chance = false then it just returns.

		var x = event.offsetX;
		var y = event.offsetY;
		
		var i = Math.floor(x / 40);
		var j = Math.floor(y / 40);
			
		if (gameboard[i][j] == 0) {
			// send it to server
			var data = { type: "gameboard-index", data1: i, data2: j, color: usr};
			connection.send(JSON.stringify(data));
			chance = false;
			document.getElementById("status").innerHTML = "Not your turn.";
		}
	};
};