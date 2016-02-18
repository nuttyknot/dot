function Player(x, y, radius, game) {
    this._x = x;
    this._y = y;
    this._radius = radius;
    this._diameter=radius*2;
    this._status = 0;
    this._game = game;
    this._speed = 0;
    this._acceration = 0.4;
    this._direction = 0; //positive = down, negative = up
    this._keyTimer = null;
    this._pir2 = Math.PI * 2;
    this._lastKey=0;
}

Player.prototype = {
    Update: function (speed) {
        //this._x+=(2*speed);
        var game = this._game;
        var floor = game._standingPlatform;
        if (this._direction !== 0) {
            this._speed += (this._direction * this._acceration);
            var difY = Math.floor(this._direction * this._speed);
            if (difY > 0) {
                if (floor && (Math.abs(floor._y-this._y)<this._radius)&&(floor._x <= this._x&&floor._x + floor._width >= this._x + this._radius)) {
                    this._y = floor._y - this._radius;
                    this._direction = 0;
                    this._speed = 0;
                    return;
                }
                for (var j = 1 ; j < difY+ this._radius; j++) {
                    var y = this._y + j;
                    var gamefloor = game._floor[y];
                    if (gamefloor) {
                        for (var i = gamefloor.length; i--;) {
                            var floor2 = gamefloor[i];
                            if (floor2._x <= this._x && floor2._x + floor2._width >= this._x + this._radius) {
                                game._standingPlatform = floor2;
                                this._y = y - this._radius;
                                this._direction = 0;
                                this._speed = 0;
                                return;
                            }
                        }
                    }
                }
            }
            this._y += difY;
            if (this._y > 500) {
                game.onLost();
                return;
            }
        } else if (floor && (floor._width<0 ||floor._x > this._x || floor._x + floor._width < this._x - this._radius)) {
            //has floor but falling off the edge
            this._direction = 1;
            game._standingPlatform = null;
        }
    },
    moveLeft: function () {
        if(this._x>=3) {
            this._x -= 2;
        }
    },
    moveRight: function () {
        if(this._x<=(10000-3)) {
            this._x += 2;
        }
    },
    Jump: function (initialSpeed) {
        //console.log(initialSpeed);
        this._direction = -1;
        if(initialSpeed>10) {
            this._speed=10;
        } else if(initialSpeed<5){
            this._speed=5;
        } else {
            this._speed = initialSpeed;
        }
    },
    Drop: function () {
        this._direction = 1;
        this._y+=(this._diameter+1);
        this._game._standingPlatform = null;
    },
    handleKey: function (event) {
        var KeyID = event.keyCode;
        if(event.type=="keyup") {
            clearInterval(this._keyTimer);
            this._keyTimer = null;
        }else {
            switch (KeyID) {
            case 38:
                // up
                if (!this._direction) {
                    //this.Jump(this._game._speed);
                    this.Jump(this._game._speed*50/this._game._updateInterval);
                }
                event.stopPropagation();
                event.preventDefault();
                break;
            case 37:
                // left
                if (this._lastKey!=65&&this._keyTimer) {
                    clearInterval(this._keyTimer);
                    this._keyTimer=null;
                }
                if(!this._keyTimer) {
                    this.moveLeft();
                    this._keyTimer = setInterval(function (thisObj) {
                        thisObj.moveLeft();
                    }, 12, this);
                }
                this._lastKey=65;
                event.stopPropagation();
                event.preventDefault();
                break;
            case 39:
                // right
                if (this._lastKey!=68&&this._keyTimer) {
                    clearInterval(this._keyTimer);
                    this._keyTimer=null;
                }
                if(!this._keyTimer) {
                    this.moveRight();
                    this._keyTimer = setInterval(function (thisObj) {
                        thisObj.moveRight();
                    }, 12, this);
                }
                this._lastKey=68;
                event.stopPropagation();
                event.preventDefault();
                break;
            case 40:
                // down
                if (!this._direction) {
                    this.Drop();
                }
                event.stopPropagation();
                event.preventDefault();
                break;
            }
        }
    },
    Draw: function (ctx) {
        ctx.fillStyle = "rgba(100,100,100,0.3)";
        ctx.beginPath();
        ctx.arc(this._x, this._y, this._radius, 0, this._pir2, true);
        ctx.closePath();
        ctx.fill();
    }
};

function Item(y,game,number) {
    this._game=game;
    var rand=Math.random();
    /*
    if(arguments.length>2) {
        this._number=number;
    }else {
        this._number=Math.floor(rand*10)+1
    }
    */
    this._number=1;
    //var a=(0.1+(rand*0.3));
    var a=0.7;
    var ch=Math.floor(rand*7);
    switch(ch) {
        case 0:this._fillStyle="rgba(255,0,0,"+a+")"; break;
        case 1:this._fillStyle="rgba(255,165,0,"+a+")"; break;
        case 2:this._fillStyle="rgba(255,255,0,"+a+")"; break;
        case 3:this._fillStyle="rgba(0,128,0,"+a+")"; break;
        case 4:this._fillStyle="rgba(0,0,255,"+a+")"; break;
        case 5:this._fillStyle="rgba(75,0,130,"+a+")"; break;
        case 6:this._fillStyle="rgba(238,130,238,"+a+")"; break;
        default:this._fillStyle="rgba(255,255,255,"+a+")"; break;
    }
    this._x = 1000; // right-most
    this._y = Math.abs(y + (Math.floor(rand * 401) - 200)) % 400; // random y
    this.isLeave=false;
    this.isCollect=false;
    this._x2=0;
    this._y2=0;

}

Item.prototype = {
    Update:function(speed) {
        //490,990 i-mix coor
        if(this.isCollect) {
            this._x+=this._x2;
            this._y+=this._y2;
            if(this._x>=990&&this._y>=490) {
                setTimeout(function (that) {
                    return (function () {
                        that._game.onCollect(that);
                    });
                }(this),10);
                this.isLeave=true;
            }
            return;
        }
        var x = this._x;
        x -= speed;
        var player=this._game._player;
        var dist=Math.sqrt((this._x+9-player._x)*(this._x+9-player._x)+(this._y-13-player._y)*(this._y-13-player._y));
        if(dist<=player._diameter) {
            this.isCollect=true;
            var sp=(speed/2);
            this._x2=sp*((990-this._x)/(490-this._y));
            this._y2=sp;
            setTimeout(function (that) {
                    return (function () {
                        that._game.onHit(that);
                    });
                }(this),10);


        }
        if (x >= 0) {
            this._x = x;
        } else {
            this.isLeave=true;
            this._x = 0;
        }
    },
    Draw: function (ctx) {
        ctx.font = '900 3em \'Droid Sans\',Arial,Helvetica,sans-serif';
        ctx.fillStyle = this._fillStyle;
        ctx.fillText("V", this._x, this._y);
    }
};

function Floor(x, y, width, height, game) /*Floor(y,game)*/
{
    // (x,y) of top left corner
    // assume canvas =1000x500
    var rand=Math.random();
    if (arguments.length == 2) {
        this._x = 1000; // right-most
        this._y = Math.abs(arguments[0] + (Math.floor(rand * 501) - 250)) % 500; // random y
        this._game = arguments[1];
        var calcWidth=400+(800/(1+this._game._score/1000));
        this._width = Math.floor(rand * calcWidth) + (calcWidth/4);
        this._height = Math.floor(rand * 40) + 20;
        this._speed =rand * 2 + 0.1;
        this._fillStyle="rgba(136,136,136,"+(0.3+(rand*0.7))+")";
    } else if (arguments.length == 5) {
        this._x = x; // right-most
        this._y = Math.abs(y); // random y
        this._width = width;
        this._height = height;
        this._game = game;
        this._speed =1;
        this._fillStyle="rgba(136,136,136,0.7)";
    }
    this.isLeave=false;
}

Floor.prototype = {
    Update: function (speed) {
        var x = this._x;
        x -= (this._speed * speed);
        if (x >= 0) {
            this._x = x;
        } else {
            this._width += x;
            this._x = 0;
            if (this._width <= 0) {
                this.isLeave=true;
                setTimeout(function (floor) {
                    return function () {
                        floor._game.onFloorLeave(floor);
                    };
                }(this),10);
            }
        }
    },
    Draw: function (ctx) {
        ctx.fillStyle = this._fillStyle;
        ctx.fillRect(this._x, this._y, this._width, this._height);
    }
};

function Game() {
    this._updateInterval = 50;
    this._accelInterval = 500;

    this._canvas=null;
    this._canvasContext=null;
    this._canvasBuffer=null;
    this._canvasBufferContext=null;
    this._width=0;
    this._height=0;

    this._floor = [];
    this._item=[];
    this._speed = 2;

    this._isPause=false;

    this._drawTimer=null;
    this._speedTimer=null;
    this._floorTimer=null;
    this._itemTimer=null;
    this._scoreTimer=null;
    this._isRunning=false;

    this._standingPlatform=null;

    this._player = null;
    this._score = 0;
    this._score_box = $("#score");
    this._multiplier=1;
    this._mul_box=$("#multiplier");
    this._grand=0;
    this._grand_box=$("#grand_total");
    this._mix=0;
    this._mix_box=$("#mix");

    this._isLost = false;
    this._audio=$("#audio")[0];
}

Game.prototype = {
    showPopup:function(msg) {
        if (arguments.length !=1||msg==null||msg.length()<1) {
            var msg='Vitamin A is good for your eyes';
        }
        var popup=$(".popup");
        var effectList=['blind', 'clip', 'drop', 'explode', 'fold', 'puff', 'slide', 'scale', 'size', 'pulsate'];
        var effect=effectList[Math.floor(Math.random()*effectList.length)];
        popup.html(msg);
        popup.show();
        popup.position({
                of: $( "#main_container" ),
                my: "center center",
                at: "center center",
                offset: '0 0',
                collision: 'none none'
            });
        popup.show(effect,{},1000);
    },
    post2fb:function() {
        console.log("post2fb");
        FB.ui({
            method: 'stream.publish',
            attachment: {
                name: "It is better when comes in 10",
                caption: 'score: '+this._score,
                description: caption,
                media: [{
                    type: 'image',
                    src: data.data.url,
                    href: link_href
                }]
            },
            action_links: [{
                text: 'Rate back!',
                href: 'http://aagpxm9q.facebook.joyent.us/fb/yours/'
            }],
            user_prompt_message: 'What\' your verdict?'
        }, function (response) {
            if (response && response.post_id) {
                $("#status").html("Post was published.");
            } else {
                $("#status").html("Post was not published.");
            }
        });
    },
    onHit:function(item) {
        //console.log(item);
    },
    onLost: function () {
        $(document).unbind('focusout');
        $(window).unbind('blur');
        this.stopMusic();
        clearInterval(this._drawTimer);
        clearInterval(this._itemTimer);
        clearInterval(this._scoreTimer);
        this._isLost = true;
        $("#score2").html(this._grand.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ","));
        $("#submit_text").hover(function(evt) {
            $("#facebook").show();
            $("#score2").hide();
        },function(evt) {
            $("#facebook").hide();
            $("#score2").show();
        });
        $(document).unbind('keyup keydown');
        $("#mix").hide();
        $(".imix_info").slideDown('slow');
        $("#canvas").hide();
        $('#main_container').animate({
            height: '-=230'
          }, 1000);
        $(".overlay .text .lost").show();
        $(".overlay .text .before_start").hide();
        $("#main_container .overlay").fadeIn('fast');
        $("#score_container").hide();
    },
    onCollect:function(item) {
        var mix=this._mix+item._number;
        if(mix>10) {
            mix=0;
            if(this._multiplier>1) {
                this._multiplier--;
            }
        } else if(mix==10){
            mix=0;
            this._multiplier++;
        }
        this._mix=mix;
        this._mix_box.html(this._mix);
        this.showPopup();
    },
    onFloorLeave: function (floor) {
        if(Math.random()>0.65) {
            var newFloor = new Floor(floor._y, this);
            this._floor[newFloor._y].push(newFloor);
        }
    },
    stopMusic:function () {
        this._audio.pause();
    },
    Init:function() {
        this._canvas = document.getElementById('canvas');

        if (this._canvas && this._canvas.getContext) {

            this._canvasContext = this._canvas.getContext('2d');

            this._canvasBuffer = document.getElementById('buffer_canvas');
            this._width = this._canvas.width;
            this._canvasBuffer.width = this._canvas.width;
            this._height = this._canvas.height;
            this._canvasBuffer.height = this._canvas.height;
            this._canvasBufferContext = this._canvasBuffer.getContext('2d');

            for (var i = (this._height + 1); i--;) {
                this._floor[i - 1] = [];
                this._item[i - 1] = [];
            }

            // first floor
            var firstFloor = new Floor(0, this._height / 2, this._width, 250, this);
            this._standingPlatform = firstFloor;
            this._floor[this._height / 2].push(firstFloor);

            this._player = new Player(this._width / 2, this._height / 2 - 10, 10, this);
            this._isPause=true;
            this.Update();
            this._isPause=false;

            $(document).bind('keyup', function (that) {
                return function (event) {
                    that.handleKey(event);
                };
            }(this));
            $("#main_container").click(function (that) {
                return function (event) {
                    that.handleKey(event);
                };
            }(this));
            $("#facebook").click(this.post2fb);
            return true;
        }
        else {
            $("#status").html("Sorry but your browser doesn't support HTML5 canvas!");
            $("#main_container").hide();
            $("#score_container").hide();
            return false;
        }
    },
    unpause:function(event) {
        this._isPause=false;
        $(".overlay").unbind('mouseenter mouseleave click');
        $("#main_container .overlay").fadeOut('fast');
        $(".overlay .pause").hide();
        this._audio.play();
        this.Run();
    },
    pause:function(event) {
        this._isPause=true;
        $(".overlay .text .before_start").hide();
        $(".overlay .pause").show();
        $("#main_container .overlay").fadeIn('fast');
        $(".overlay").unbind('click mouseenter mouseleave');
        $(".overlay").hover(function() {
            $("#pause_text").addClass("unpause");
            $("#pause_text").html('<span class="grey">un</span>pause');
        }, function() {
            $("#pause_text").removeClass("unpause");
            $("#pause_text").html("pause");
        });
        $(".overlay").click(function (that) {
                return function (event) {
                    that.unpause(event);
                };
        }(this));
        this.stopMusic();
        clearInterval(this._drawTimer);
        clearInterval(this._scoreTimer);
        clearInterval(this._speedTimer);
        clearInterval(this._floorTimer);
        clearInterval(this._itemTimer);
    },
    handleKey:function(event) {
        if(this._audio.canPlayType) {
            this._audio.volume=0.125;
            this._audio.play();
            setTimeout(function (that) {
                return function increaseVolume() {
                    that._audio.volume+=0.125;
                    if(that._audio.volume<1) {
                        setTimeout(increaseVolume,250);
                    }
                };
            }(this), 250);
        }
        $("#main_container .overlay").fadeOut('fast');
        $("#score_container").fadeIn('fast');
        $(document).unbind('keyup keydown');
        $("#main_container").unbind('click');
        $(document).bind('keyup keydown', function (player) {
            return function (event) {
                player.handleKey(event);
            };
        }(this._player));
        if($.browser.msie) {
            $(document).bind('focusout',function (that) {
                    return function (event) {
                        that.pause(event);
                    };
            }(this));
        }else {
            $(window).bind('blur',function (that) {
                    return function (event) {
                        that.pause(event);
                    };
            }(this));
        }
        $("#mix").show();
        this.Run();
    },
    Run: function () {
        this._drawTimer = setTimeout(function (thisObj) {
            thisObj.Update();
        }, this._updateInterval, this);
        this._scoreTimer = setInterval(function (thisObj) {
            thisObj.UpdateScore();
        }, 50, this);
        this._speedTimer = setTimeout(function (thisObj) {
            thisObj.Accelerate();
        }, this._accelInterval, this);
        this._floorTimer = setTimeout(function (thisObj) {
            thisObj.NewFloor();
        }, Math.floor(Math.random(3000)+500), this);
        this._itemTimer = setInterval(function (thisObj) {
            thisObj.NewItem();
        }, 1000, this);
    },
    NewFloor: function () {
        var newFloor = new Floor(this._player._y, this);
        this._floor[newFloor._y].push(newFloor);
        var rand=Math.random();
        if (!this._isLost&&!this._isPause) {
            this._floorTimer = setTimeout(function (thisObj) {
                thisObj.NewFloor();
            }, Math.floor(rand*2000>500?rand*2000:500), this);
        }
    },
    NewItem: function() {
        var rand=Math.random();
        if(rand>0.6) {
            var newItem = new Item(this._player._y,this);
            this._item[newItem._y].push(newItem);
        }
    },
    Accelerate: function () {
        /*if (this._speed > 7) {
            clearInterval(this._speedTimer);
            this._speedTimer = setInterval(function (thisObj) {
                thisObj.moreAccelerate();
            }, 10000, this);
        }*/
        if (this._isPause||this._isLost) {
            clearInterval(this._speedTimer);
        }
        if(this._updateInterval<=20) {
            this._speed*=2;
            this._updateInterval*=2;
            this._accelInterval*=2;
        } else {
            this._updateInterval /= 1.0625;
        }
        this._speedTimer = setTimeout(function (thisObj) {
            thisObj.Accelerate();
        }, this._accelInterval, this);
    },
    moreAccelerate: function () {
        if (this._isLost) {
            clearInterval(this._speedTimer);
        }
        this._speed *= 1.0625;
    },
    UpdateScore: function () {
        this._score++;
        this._grand=this._score*this._multiplier;
        // add comma
        this._score_box.html(this._score);
        this._mul_box.html(this._multiplier);
        this._grand_box.html(this._grand.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ","));
    },
    Update: function (ev) {
        this._canvasBufferContext.clearRect(0, 0, this._canvas.width, this._canvas.height);
        for (var i = this._floor.length; i--;) {
            for (var j = this._floor[i].length; j--;) {
                var curFloor=this._floor[i][j];
                if(curFloor.isLeave) {
                    delete curFloor;
                    this._floor[i].splice(j, 1);
                } else {
                    curFloor.Update(this._speed);
                    if (curFloor) {
                        curFloor.Draw(this._canvasBufferContext);
                    }
                }
            }
            for (var j = this._item[i].length; j--;) {
                var curItem=this._item[i][j];
                if(curItem.isLeave) {
                    delete curItem;
                    this._item[i].splice(j, 1);
                } else {
                    curItem.Update(this._speed);
                    if (curItem) {
                        curItem.Draw(this._canvasBufferContext);
                    }
                }
            }
        }
        this._player.Update(this._speed);
        this._player.Draw(this._canvasBufferContext);

        //draw buffer on screen
        this._canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._canvasContext.drawImage(this._canvasBuffer, 0, 0);

        if(!this._isPause&&!this._isLost) {
            this._drawTimer = setTimeout(function (thisObj) {
                thisObj.Update();
            }, this._updateInterval, this);
        }
    }
};

function login() {
    FB.login(function (a) {
        if (a.session) {
            if (a.perms) {
                window.location.reload(false);
            } else {
                $("#status").html("...if you'd given enough permission!");
            }
        }
    }, {
        perms: "publish_stream"
    });
}

$(document).ready(function () {
    var game = new Game();
    game.Init();
    if(window.FB !== undefined) {
        FB.init({
            appId: 173577726002697,
            channelUrl : '//dl.dropbox.com/u/1629873/facebook/dot/channel.html',
            status: true,
            cookie: true,
            xfbml: true
        });
        $("#login").click(function () {
            login();
        });
        FB.getLoginStatus(function(response) {
            if (response.status === 'unknown') {
                $("#control").hide();
                $("#status").html("...if you logged in to Facebook!");
                $("#login").show();
            }
        });
        FB.Canvas.setSize();
    }
    $("#retry_text").click(function() {
        window.location.reload(false);
    });
});