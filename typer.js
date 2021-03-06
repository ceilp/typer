var Word = Backbone.Model.extend({
	move: function() {
		this.set({y:this.get('y') + this.get('speed')});
	}
});

var Words = Backbone.Collection.extend({
	model:Word
});

var WordView = Backbone.View.extend({
	initialize: function() {
		$(this.el).css({position:'absolute'});
		var string = this.model.get('string');
		var letter_width = 25;
		var word_width = string.length * letter_width;
		if(this.model.get('x') + word_width > $(window).width()) {
			this.model.set({x:$(window).width() - word_width});
		}
		for(var i = 0;i < string.length;i++) {
			$(this.el)
				.append($('<div>')
					.css({
						width:letter_width + 'px',
						padding:'5px 2px',
						'border-radius':'4px',
						'background-color':'#fff',
						border:'1px solid #ccc',
						'text-align':'center',
						display:'inline-block'
					})
					.text(string.charAt(i).toUpperCase()));
		}
		
		this.listenTo(this.model, 'remove', this.remove);
		
		this.render();
	},
	
	render:function() {
		$(this.el).css({
			top:this.model.get('y') + 'px',
			left:this.model.get('x') + 'px'
		});
		var highlight = this.model.get('highlight');
		$(this.el).find('div').each(function(index,element) {
			if(index < highlight) {
				$(element).css({'font-weight':'bolder','background-color':'#aaa',color:'#fff'});
			} else {
				$(element).css({'font-weight':'normal','background-color':'#fff',color:'#000'});
			}
		});
	}
});

var TyperView = Backbone.View.extend({
	initialize: function() {
		var wrapper = $('<div>')
			.css({
				position:'fixed',
				top:'0',
				left:'0',
				width:'100%',
				height:'100%',
                "white-space":'nowrap'
			});
		this.wrapper = wrapper;
		
		var self = this

        var score = $('<div>')
            .css({
                'border-radius':'4px',
                position:'absolute',
                top: '10px',
                left: '10px',
                'margin-bottom':'10px',
                'z-index':'1000',
                background:'white',
                padding:'10px'
            });
        this.renderScore(score);

		var text_input = $('<input>')
			.addClass('form-control')
			.css({
				'border-radius':'4px',
				position:'absolute',
				bottom:'0',
				'min-width':'80%',
				width:'80%',
				'margin-bottom':'10px',
				'z-index':'1000'
			}).keyup(function() {
                if(!self.model.get('interval'))return;
				var words = self.model.get('words');
                var no_match = true;
                var typed_string = $(this).val();
				for(var i = 0;i < words.length;i++) {
					var word = words.at(i);
					var string = word.get('string');
					if(string.toLowerCase().indexOf(typed_string.toLowerCase()) == 0) {
						word.set({highlight:typed_string.length});
						if(typed_string.length == string.length) {
							$(this).val('');
                            self.model.set('score',self.model.get('score')+1);
                            self.renderScore(score);
						}
						no_match = false;
					} else {
						word.set({highlight:0});
					}
				}
				if(typed_string.length>0 && no_match){
                    self.model.set('score',self.model.get('score')-1);
                    $(this).val('');
                    self.renderScore(score);
                }
			});

        var button_start = $('<button>')
            .addClass('btn btn-default btn-sm')
            .append(
                $('<span>')
                    .addClass('glyphicon glyphicon-play')
                    .text(' Start/Resume')
            )
            .click(function(){
                text_input.prop('disabled',false);
                self.model.start();
                text_input.focus();
            });
        var button_stop = $('<button>')
            .addClass('btn btn-default btn-sm')
            .append(
                $('<span>')
                    .addClass('glyphicon glyphicon-stop')
                    .text(' Stop')
            )
            .click(function(){
                text_input.prop('disabled',true);
                self.model.stop();
            });
        var button_pause = $('<button>')
            .addClass('btn btn-default btn-sm')
            .append(
                $('<span>')
                    .addClass('glyphicon glyphicon-pause')
                    .text(' Pause')
            )
            .click(function(){
                text_input.prop('disabled',true);
                self.model.pause();
            });

        var control = $('<div>')
            .css({
                position:'absolute',
                top: '10px',
                right: '10px',
                'z-index':'1000'
            })
            .append(button_start)
            .append(button_stop)
            .append(button_pause);

		$(this.el)
			.append(wrapper
				.append($('<form>')
					.attr({
						role:'form'
					})
					.submit(function() {
						return false;
					})
					.append(text_input)
                    .append(score)
                    .append(control)
                )
            );
		
		text_input.css({left:((wrapper.width() - text_input.width()) / 2) + 'px'});
		text_input.focus();
		
		this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'reset:game', function(){
            console.log('trigged');
            self.renderScore(score);
            text_input.val('');
        });
	},
	
	render: function() {
		var model = this.model;
		var words = model.get('words');
		
		for(var i = 0;i < words.length;i++) {
			var word = words.at(i);
			if(!word.get('view')) {
				var word_view_wrapper = $('<div>');
				this.wrapper.append(word_view_wrapper);
				word.set({
					view:new WordView({
						model: word,
						el: word_view_wrapper
					})
				});
			} else {
				word.get('view').render();
			}
		}
	},

	renderScore: function(score_el){
        score_el.text("Score : " + this.model.get('score'));
    }
});

var Typer = Backbone.Model.extend({
	defaults:{
		max_num_words:10,
		min_distance_between_words:50,
		words:new Words(),
		min_speed:1, // speed for 100ms
		max_speed:5, // speed for 100ms
        frame_rate:6, // frame rate 60fps
        score:0,
        interval:null,
        started:false
	},
	
	initialize: function() {
		new TyperView({
			model: this,
			el: $(document.body)
		});
	},

	start: function() {
        var interval = this.get('interval');
        if(!this.get('started'))this.set('started',true);
        if(!interval){ // resume
            var animation_delay = 100 / this.get('frame_rate');
            var self = this;
            interval = setInterval(function() {
                self.iterate();
            },animation_delay);
            this.set('interval',interval);
        }
	},

    stop: function() {
        var interval = this.get('interval');
        if(interval) {
            clearInterval(interval);
            this.set('interval', null);
        }
        if(this.get('started')){
            this.set('score',0);
            this.trigger('reset:game');
            var words = this.get('words');
            for(var i = words.length - 1;i >= 0;i--) {
                words.remove(words.at(i));
            }
            this.set('started',false);
        }
    },

    pause: function() {
        var interval = this.get('interval');
        if(interval){
            clearInterval(interval);
            this.set('interval',null);
        }
    },
	
	iterate: function() {
		var words = this.get('words');
		if(words.length < this.get('max_num_words')) {
			var top_most_word = undefined;
			for(var i = 0;i < words.length;i++) {
				var word = words.at(i);
				if(!top_most_word) {
					top_most_word = word;
				} else if(word.get('y') < top_most_word.get('y')) {
					top_most_word = word;
				}
			}
			
			if(!top_most_word || top_most_word.get('y') > this.get('min_distance_between_words')) {
				var random_company_name_index = this.random_number_from_interval(0,company_names.length - 1);
				var string = company_names[random_company_name_index];
				var filtered_string = '';
				for(var j = 0;j < string.length;j++) {
					if(/^[a-zA-Z()]+$/.test(string.charAt(j))) {
						filtered_string += string.charAt(j);
					}
				}
				var speed = this.random_number_from_interval(this.get('min_speed'),this.get('max_speed'));
				var word = new Word({
					x:this.random_number_from_interval(0,$(window).width()),
					y:0,
					string:filtered_string,
					'speed':speed
				});
				console.log(speed);
				words.add(word);
			}
		}
		
		var words_to_be_removed = [];
		for(var i = 0;i < words.length;i++) {
			var word = words.at(i);
			word.move();
			
			if(word.get('y') > $(window).height() || word.get('move_next_iteration')) {
				words_to_be_removed.push(word);
			}
			
			if(word.get('highlight') && word.get('string').length == word.get('highlight')) {
				word.set({move_next_iteration:true});
			}
		}
		
		for(var i = 0;i < words_to_be_removed.length;i++) {
			words.remove(words_to_be_removed[i]);
		}
		
		this.trigger('change');
	},
	
	random_number_from_interval: function(min,max) {
	    return Math.floor(Math.random()*(max-min+1)+min);
	}
});