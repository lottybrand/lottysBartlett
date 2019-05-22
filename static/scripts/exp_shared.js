// this function runs immediately once the page is loaded
$(document).ready(function() {

    // initially hide all divs except the welcome div
    $("#welcome_div").show();
    $("#wait_div").show();

    // Add functionality to buttons controlling participants answers
    // either option a, option b, or copy someone else.
    $("#submit-a").click(function() {
        submit_answer("#submit-a")
    });

    $("#submit-b").click(function() {
        submit_answer("#submit-b")
    });

    $("#submit-copy").click(function() {
        submit_answer("#submit-copy")
    });

    submit_answer = function(answer) {
        stop_countdown();
        $("#question_div").hide();
        $("#wait_div").show();
        submit_response(response=$(answer).text());
    }

    add_neighbor_buttons();
    get_details_from_store();
    get_transmissions();
});

stop_countdown = function() {
    clearTimeout(answer_timeout);
    $("#countdown").html("");
}

// allows variables to be passed between pages
get_details_from_store = function() {
    my_node_id = store.get("node_id");
    my_network_id = store.get("network_id");
    condition = store.get("condition");
    $("#welcome").html("Welcome to our quiz, you are player " + store.get("node_name"));
}

// get any pending incoming transmissions
// this function is called repeatedly while we are waiting for other to catch up.
// You should only ever get one transmission at a time, so if you get > 1 the 
// experiment just hangs.
get_transmissions = function() {
    dallinger.getTransmissions(my_node_id, {
        status: "pending"
    })
    .done(function (resp) {
        console.log("*** Checking for transmissions");
        transmissions = resp.transmissions;
        console.log("*** Resp:" + resp);
        if (transmissions.length > 0) {
            if (transmissions.length > 1) {
                console.log("More than one transmission - unexpected!");
            } else {
                console.log("*** Got one transmission, info id: " + transmissions[0].info_id);
                get_info(transmissions[0].info_id);
            }
        } else {
            console.log("*** Got 0 transmissions, waiting 1s and repeating");
            setTimeout(function(){
                get_transmissions();
            }, 1000);
        }
    })
    .fail(function (rejection) {
        console.log(rejection);
        $('body').html(rejection.html);
    });
}

// get a specific info
// use to get the contents of an info you have been sent.
var get_info = function(info_id) {
    dallinger.getInfo(my_node_id, info_id)
    .done(function(resp) {
        console.log("*** Getting info: " + resp);
        process_info(resp.info);
    })
    .fail(function (rejection) {
        console.log(rejection);
        $('body').html(rejection.html);
    });
}

// Process an info.
// 
var process_info = function(info) {
    // a contents of "Bad Luck" indicates that everyone copied.
    // participants are forced to answer "Bad Luck" which is always wrong.
    console.log("*** Processing info");
    if (info.contents == "Bad Luck") {
        console.log("*** info was bad luck");
        $("#wait_div").hide();
        $("#bad_luck_div").show();
        setTimeout(function() {
            $("#bad_luck_div").hide();
            submit_response(response="Bad Luck",
                            copy=undefined,
                            info_chosen=undefined,
                            human=false);
        }, 3000);

    // a contents of "Good luck" indicates you chose to copy, but not everyone else did.
    // depending on the round and condition different things will happen
    } else if (info.contents == "Good Luck") {
        console.log("*** Info was good luck");
        process_good_luck();

    // Any other contents indicates its a question from the source.
    } else {
        // get question details
        console.log("*** Info is a question");
        parse_question(info);

        display_question_or_warning();
    }
};

// Extract the relevant information from a question Info.
parse_question = function(question) {
    console.log("*** Parsing question");
    question_json = JSON.parse(question.contents);
    round = question_json.round;
    question_text = question_json.question;
    Wwer = question_json.Wwer;
    Rwer = question_json.Rwer;
    number = question_json.number;
    topic = question_json.topic;
    round = question_json.round;
    pic = question_json.pic;
}

// display the question
display_question = function() {
    console.log("*** Displaying question");
    
    $("#question").html(question_text);
    update_question_number_text()
    
    if (pic == true) {
        show_pics(number);
    } else {
        hide_pics();
    }

    if (Math.random() <0.5) {
        $("#submit-a").html(Wwer);
        $("#submit-b").html(Rwer);
    } else {
        $("#submit-b").html(Wwer);
        $("#submit-a").html(Rwer);
    }
    
    countdown = 15;
    $("#countdown").html(countdown);

    $("#wait_div").hide();
    $("#question_div").show();
    start_answer_timeout();
}

submit_response = function(response, copy=false, info_chosen="NA", human=true) {
    dallinger.createInfo(my_node_id, {
        contents: response,
        info_type: "LottyInfo",
        property1: JSON.stringify({
            "number": number,
            "copying": copy,
            "score": (response == Rwer)*1,
            "info_chosen": info_chosen,
            "round": round,
            "human": human
        })
    }).done(function (resp) {
        response_submitted(resp);
    })
    .fail(function (rejection) {
        dallinger.error(rejection);
    });
}

start_answer_timeout = function() {
    answer_timeout = setTimeout(function() {
        countdown = countdown - 1;
        $("#countdown").html(countdown);
        if (countdown <= 0) {

            $("#question_div").hide();
            $("#countdown").html("");
            $("#wait_div").show();

            submit_response(Wwer,
                            copy=undefined,
                            info_chosen=undefined,
                            human=false);
        } else {
            start_answer_timeout();
        }
    }, 1000);
}

var check_neighbors = function(info_chosen) {
    // get your neighbors
    dallinger.get(
        "/node/" + my_node_id + "/neighbors",
        {
            connection: "from",
            node_type: "LottyNode"
        }
    ).done(function (resp) {
        neighbors = resp.nodes;
        process_neighbors();
    })
}

process_neighbors = function() {
    // update neighbor prompt
    if (neighbors.length == 1) {
        part1 = ("You have " + neighbors.length + " player to copy from, ");
        if (info_chosen == "Player ID") { 
            part2 = "below is their Player ID.";
        } else if (info_chosen == "Times chosen in Round 1") {
            part2 = "below is how many times they were chosen in Round 1 by other players.";
        } else if (info_chosen == "Total Score in Round 1") {
            part2 = "below is the number of questions they have answered correctly themselves.";
        }
    } else {
        part1 = ("You have " + neighbors.length + " players to copy from, ");
        if (info_chosen == "Player ID") { 
            part2 = "below are their Player IDs.";
        } else if (info_chosen == "Times chosen in Round 1") {
            part2 = "below are how many times they were chosen in Round 1 by other players.";
        } else if (info_chosen == "Total Score in Round 1") {
            part2 = "below are the number of questions they have answered correctly themselves.";
        }
    }

    $("#neighbor_prompt").html(part1 + part2 + " Please select a player to copy.")    

    // update neighbor buttons
    current_button = 1;
    neighbors.forEach(function(entry) {
        update_neighbor_button(current_button, entry)        
        current_button = current_button + 1;
    });

    // show the div
    $("#wait_div").hide()
    $("#neighbor_div").show()
};

update_neighbor_button = function(number, neighbor) {
    // get neighbor properties, and button details
    neighbor_properties = JSON.parse(neighbor.property1);
    button_id = "#neighbor_button_" + current_button;
    neighbor_image = "<img src='/static/images/stick.png' height='90' width='50'><br>";

    // update button and question display according to info_chosen
    if (info_chosen == "Player ID") { 
        $(button_id).html(neighbor_image + "player ID: " + neighbor_properties.name);

    } else if (info_chosen == "Times chosen in Round 1") {
        $(button_id).html(neighbor_image + "chosen " + neighbor_properties.n_copies + " times");

    } else if (info_chosen == "Total Score in Round 1") {
        $(button_id).html(neighbor_image + neighbor_properties.asoc_score + " correct");
    }
    
    // add button functionality
    $(button_id).click(function() {
        submit_response(response=neighbor.id,
                        copy=true,
                        info_chosen=info_chosen);
        disable_neighbor_buttons();
        $("#neighbor_prompt").hide();
    });
    $(button_id).prop("disabled", false);
    $(button_id).show();
};

disable_neighbor_buttons = function() {
    for (i = 1; i <= group_size-1; i++) {
        button_string = "#neighbor_button_" + i;
        $(button_string).html("");
        $(button_string).hide();
        $(button_string).prop("disabled",true);
        $(button_string).off("click");
    }
    $("#question").html("Waiting for other players to catch up.");
}

hide_pics = function() {
    $("#pics").hide();
}

show_pics = function(number) {
    $("#pics").attr("src", "/static/images/" + number + ".png");
    $("#pics").show();
}


// This is called by the exp.html page, it creates a set of buttons for your current
// group size.
add_neighbor_buttons = function() {
    dallinger.getExperimentProperty("group_size")
    .done(function (resp) {
        group_size = resp.group_size;
        start = '<button id="neighbor_button_';
        stop = '" type="button" class="btn btn-success"></button>';
        button_string = '';
        for (i = 1; i <= group_size-1; i++) {
            button_string = button_string.concat(start);
            button_string = button_string.concat(i);
            button_string = button_string.concat(stop);
        }
        $("#neighbor_buttons").html(button_string);
        for (i = 1; i <= group_size-1; i++) {
            button_string = "#neighbor_button_" + i;
            $(button_string).css({
                "margin-right": "14px"
            });
            $(button_string).hide();
            $(button_string).prop("disabled",true);
        }
    });
}




