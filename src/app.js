
var eachStepAngleDif  = 5;
var MaxRotateAngle = 90;

var HelloWorldLayer = cc.Layer.extend({

    //Size
    visibleSize:null,
    origin:null,

    //Physics
    ChipmunkSpace:null,
    _debugNode:null,

    //Game Play UI Object
    targetSpr:null,
    targetShape:null,
    cannonSpr:null,
    bulletSpr:null,
    catapultWheelFrontSpr:null,
    currentGameStatusLabel:null,
    ScoreLabel:null,

    //game Related Variable
    currentRotattionStep:0,
    isGameRunning:false,
    continuesgameLosseCount:0,
    currentScoreCount:0,

    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        //taking visible size and origin
        var pDirector = cc.director;
        this.visibleSize = pDirector.getVisibleSize();
        this.origin = pDirector.getVisibleOrigin();

        //Physics
        this.ChipmunkSpace = null;
        this._debugNode = null;

        //Game Play UI Object
        this.targetSpr = null;
        this.targetShape = null;
        this.cannonSpr = null;
        this.bulletSpr = null;
        this.catapultWheelFrontSpr = null;
        this.currentGameStatusLabel = null;
        this.ScoreLabel = null;

        //game Related Variable
        this.currentRotattionStep = 0;
        this.isGameRunning = false;
        this.continuesgameLosseCount = 0;
        this.currentScoreCount = 0;

        //Create Physics World
        this.createPhysicsWorld();

        /////////////////////////////
        //Create UI
        this.addUI();

        return true;
    },
    onEnter : function () {

        this._super();

        //Physics Init
        this.initPhysics();
        this.scheduleUpdate();

        //Collision handler
        this.ChipmunkSpace.setDefaultCollisionHandler(
            this.collisionBegin.bind(this),
            this.collisionPre.bind(this),
            this.collisionPost.bind(this),
            this.collisionSeparate.bind(this)
        );

        //Add Keyboard Event
        this.addKeyboardEvent();
    },
    onExit : function() {
        this.ChipmunkSpace.removeCollisionHandler( 1, 2 );
    },

    //Keyboard
    addKeyboardEvent:function ()
    {
        var self = this;
        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    var strTemp = "Key up:" + key;
                    var keyStr = self.getKeyStr(key);
                    if (keyStr.length > 0)
                    {
                        self.actionOnkeyboardPressed(keyStr);
                    }
                },
                onKeyReleased: function (key, event) {

                }
            }, this);
        } else {
            cc.log("KEYBOARD Not supported");
        }
    },
    getKeyStr: function (keycode)
    {
        if (keycode == cc.KEY.none)
        {
            return "";
        }
        for (var keyTemp in cc.KEY)
        {
            if (cc.KEY[keyTemp] == keycode)
            {
                return keyTemp;
            }
        }
        return "";
    },
    actionOnkeyboardPressed: function (keyStr)
    {
        if (this.isGameRunning)
            return;

        if(keyStr == "up")
        {
            //increment Angle
            var rotationStep = this.currentRotattionStep;
            rotationStep = rotationStep + 1;
            var rotationAngle = rotationStep * eachStepAngleDif;
            if (rotationAngle <= MaxRotateAngle)
            {
                this.cannonSpr.setRotation(-rotationAngle);
                this.currentRotattionStep = rotationStep;
            }
        }
        else if(keyStr == "down")
        {
            //decremnt angle
            var rotationStep = this.currentRotattionStep;
            rotationStep = rotationStep - 1;
            var rotationAngle = rotationStep * eachStepAngleDif;
            if (rotationAngle >= 0)
            {
                this.cannonSpr.setRotation(-rotationAngle);
                this.currentRotattionStep = rotationStep;
            }
        }
        else if(keyStr == "enter")
        {
            this.createBulletSpr();
        }
    },

    //Physics
    createPhysicsWorld:function ()
    {
        //Chipmunk
        // Create the initial space
        this.ChipmunkSpace = new cp.Space();

        //Debug node
        this._debugNode = new cc.PhysicsDebugNode(this.ChipmunkSpace );
        this._debugNode.visible = false ;
        this.addChild( this._debugNode , 10 );

    },
    initPhysics : function() {

        var winSize = cc.size(this.visibleSize.width ,this.visibleSize.height);
        var staticBody = this.ChipmunkSpace.staticBody;

        // Walls
        var walls = [ new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(winSize.width,0), 0 ),               // bottom
            new cp.SegmentShape( staticBody, cp.v(0,winSize.height), cp.v(winSize.width,winSize.height), 0),    // top
            new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(0,winSize.height), 0),             // left
            new cp.SegmentShape( staticBody, cp.v(winSize.width,0), cp.v(winSize.width,winSize.height), 0)  // right
        ];
        for( var i=0; i < walls.length; i++ ) {
            var shape = walls[i];
            shape.setElasticity(1);
            shape.setFriction(1);
            shape.setCollisionType(1);
            this.ChipmunkSpace.addStaticShape( shape );
        }

        // Gravity
        this.ChipmunkSpace.gravity = cp.v(0, -200);
    },

    update : function( delta ) {
        //cc.log("... Physics Step Update .....");
        this.ChipmunkSpace.step( delta );
    },

    //Add Ui
    addUI:function()
    {
        //background
        var backgroundSpr = new cc.Sprite(res.background_png);
        backgroundSpr.attr({
            x: this.visibleSize.width / 2 + this.origin.x,
            y: this.visibleSize.height / 2 + this.origin.y
        });
        this.addChild(backgroundSpr);

        //Catapult Wheel
        this.catapultWheelFrontSpr = new cc.Sprite(res.wheel_front_png);
        this.catapultWheelFrontSpr.attr({
            x: this.visibleSize.width / 6 + this.origin.x,
            y: this.visibleSize.height / 5 + this.origin.y
        });
        this.addChild(this.catapultWheelFrontSpr,2);

        var catapultWheelBackSpr = new cc.Sprite(res.wheel_back_png);
        catapultWheelBackSpr.attr({
            x: this.catapultWheelFrontSpr.getContentSize().width / 2,
            y: this.catapultWheelFrontSpr.getContentSize().height/1.2
        });
        this.catapultWheelFrontSpr.addChild(catapultWheelBackSpr, -2);

        //Cannon
        this.cannonSpr = new cc.Sprite(res.Cannon_png);
        this.cannonSpr.attr({
            x: this.catapultWheelFrontSpr.getContentSize().width / 3,
            y: this.catapultWheelFrontSpr.getContentSize().height/ 3
        });
        this.catapultWheelFrontSpr.addChild(this.cannonSpr);
        this.cannonSpr.setAnchorPoint(0,0.5);
        this.cannonSpr.setRotation(-30);
        this.currentRotattionStep = 6;

        //Wall
        var wallSpr = new cc.Sprite(res.wall_png);
        var wallPos = cc.p(this.visibleSize.width / 2 + this.origin.x,this.visibleSize.height / 5 + this.origin.y + wallSpr.getContentSize().height/3.5);

        var wallbody =  new cp.StaticBody();
        wallbody.setPos(wallPos);

        var wallShape = new cp.BoxShape( wallbody, wallSpr.getContentSize().width, wallSpr.getContentSize().height);
        wallShape.setElasticity( 0.5 );
        wallShape.setFriction( 0.5 );
        this.ChipmunkSpace.addStaticShape( wallShape );

        var wallSprBody = new cc.PhysicsSprite(res.wall_png);
        wallSprBody.setBody( wallbody );
        this.addChild(wallSprBody);

        //target Spr
        this.addTarget();

        //UI
        this.currentGameStatusLabel = new cc.LabelTTF("Shoot The Target", "Arial", 24);
        this.addChild(this.currentGameStatusLabel);
        this.currentGameStatusLabel .x = this.visibleSize.width / 2 + this.origin.x;
        this.currentGameStatusLabel .y = this.visibleSize.height / 1.1 + this.origin.y;
        this.currentGameStatusLabel.color = cc.color(0, 0, 0);

        var scoreStr = "Score: " + this.currentScoreCount;
        this.ScoreLabel = new cc.LabelTTF(scoreStr, "Arial", 24);
        this.addChild(this.ScoreLabel);
        this.ScoreLabel .x = this.visibleSize.width / 1.1 + this.origin.x;
        this.ScoreLabel .y = this.visibleSize.height / 1.1 + this.origin.y;
        this.ScoreLabel.color = cc.color(0, 0, 0);

    },
    addTarget:function ()
    {
        var getRandXPos = this.getRandomNumberBetween(this.visibleSize.width / 1.6 + this.origin.x, this.visibleSize.width / 1.2 + this.origin.x);
        var targetSprref = new cc.Sprite(res.Target_png);
        var body =  cp.StaticBody();
        body.setPos(cc.p(getRandXPos,this.visibleSize.height / 4 + this.origin.y));

        this.targetShape = new cp.BoxShape( body, targetSprref.getContentSize().width * 0.8, targetSprref.getContentSize().height * 0.8);
        this.targetShape.setElasticity( 0.5 );
        this.targetShape.setFriction( 0.5 );
        this.targetShape.setCollisionType(2);
        this.ChipmunkSpace.addShape(this.targetShape);

        this.targetSpr = new cc.PhysicsSprite(res.Target_png);
        this.targetSpr.setBody( body );
        this.addChild(this.targetSpr);
    },

    createBulletSpr:function ()
    {
        this.currentGameStatusLabel.setString("");
        this.isGameRunning = true;
        var currentCannonPos = this.catapultWheelFrontSpr.convertToWorldSpace(this.cannonSpr.getPosition());
        currentCannonPos = this.getStraightPointWithRadius(this.cannonSpr.getContentSize().width / 1.2, Math.abs(this.cannonSpr.getRotation() + 90), currentCannonPos);

        var body = new cp.Body(1, cp.momentForBox(0.5, 20, 20) );
        body.setPos(currentCannonPos);
        body.fixedRotation = true;
        this.ChipmunkSpace.addBody(body);

        var shape = new cp.CircleShape(body,10,cc.p(0,0));// new cp.BoxShape( body, 48, 108);
        shape.setElasticity( 0.8 );
        shape.setFriction( 0.2 );
        this.ChipmunkSpace.addShape( shape );
        shape.setCollisionType(3);

        body.setMass(10);
        body.setMoment(Infinity);

        this.bulletSpr = new cc.PhysicsSprite(res.bullet_png);
        this.bulletSpr.setBody( body );
        this.addChild(this.bulletSpr,1);

       // var forceY = body.m * Math.abs(this.cannonSpr.getRotation() / 2); //30
        //var forceX = body.m * 20; //10
        var curangle = Math.abs(this.cannonSpr.getRotation());
        cc.log("curangle ....."+curangle);
        var velocity_X = 350 * Math.cos(cc.degreesToRadians(curangle));
        var velocity_Y = 350 * Math.sin(cc.degreesToRadians(curangle));
        cc.log("velocity X ....."+velocity_X);
        cc.log("velocity X ....."+velocity_Y);
        body.setVel(cc.p(velocity_X,velocity_Y));

    },

    //Collision Handler
    collisionBegin : function ( arbiter, space ) {
        return true;
    },

    collisionPre : function ( arbiter, space ) {
       // cc.log('collision pre');
        return true;
    },

    collisionPost : function ( arbiter, space ) {
       // cc.log('collision post');
        var shapes = arbiter.getShapes();
        var collTypeA = shapes[0].collision_type;
        var collTypeB = shapes[1].collision_type;

        var self = this;
        space.addPostStepCallback(function(){
            cc.log("post step callback 1");

            //Check for Wall Collision
            if (collTypeA == 1 && collTypeB == 3)
            {
                //Loss the Game
                self.onGameresult(shapes[1], false );
            }
            else if (collTypeA == 3 && collTypeB == 1)
            {
                //Loss the Game
                self.onGameresult(shapes[0], false );
            }
            else if(collTypeA == 3 && collTypeB == 2)
            {
                //Win The Game
                cc.log(".... Win The Game....");
                collTypeB.collision_type = Infinity;
                self.onGameresult(shapes[0], true );
            }
            else if(collTypeA == 2 && collTypeB == 3)
            {
                //Win The Game
                cc.log(".... Win The Game....");
                collTypeA.collision_type = Infinity;
                self.onGameresult(shapes[1], true);
            }
        });
    },
    collisionSeparate : function ( arbiter, space ) {
        // cc.log('collision separate');
    },

    //Game Win result
    onGameresult:function (collageShape , isWinGame)
    {
        if (!isWinGame)
        {
            this.currentGameStatusLabel.setString("You Lost the Game");
            this.currentScoreCount = this.currentScoreCount - 5;
            this.continuesgameLosseCount = this.continuesgameLosseCount + 1;
        }
        else
        {
            this.currentGameStatusLabel.setString("You Won the Game");
            this.currentScoreCount = this.currentScoreCount + 10;
            this.continuesgameLosseCount = 0;
        }
        if(this.currentScoreCount < 0)
            this.currentScoreCount = 0;

        this.updateScore();

        var bodyRef = this.bulletSpr.getBody();
        this.ChipmunkSpace.removeBody(bodyRef);
        this.ChipmunkSpace.removeShape(collageShape);

        this.bulletSpr.removeAllChildren(true);
        this.bulletSpr.removeFromParent(true);
        this.bulletSpr = null;

        this.targetSpr.removeAllChildren(true);
        this.targetSpr.removeFromParent(true);
        this.targetSpr = null;

        this.ChipmunkSpace.removeStaticShape(this.targetShape);
        this.targetShape = null;

        this.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(this.resetGame, this))
        );
    },
    updateScore:function ()
    {
        var scoreStr = "Score: " + this.currentScoreCount;
        this.ScoreLabel.setString(scoreStr);
    },
    resetGame:function ()
    {
        if (this.continuesgameLosseCount >= 3)
        {
            //lose
            var gameresultlayer = GameOverScreen.createLayer();
            this.addChild(gameresultlayer, 10);
            gameresultlayer.mainGameref = this;
            gameresultlayer.isGameWon = false;
            gameresultlayer.addUI();
        }
        else if(this.currentScoreCount >= 100)
        {
            //Win
            var gameresultlayer = GameOverScreen.createLayer();
            this.addChild(gameresultlayer, 10);
            gameresultlayer.mainGameref = this;
            gameresultlayer.isGameWon = true;
            gameresultlayer.addUI();
        }
        else
        {
            this.addTarget();
            this.isGameRunning = false;
            this.currentGameStatusLabel.setString("Shoot The Target");
        }
    },

    backfromresultScreen:function ()
    {
        cc.log("... Back From Result...");
        this.currentScoreCount = 0;
        this.continuesgameLosseCount = 0;
        this.updateScore();
        this.resetGame();

    },

    //utility
    getStraightPointWithRadius:function (pRadius, pAngle, pStartPoint)
    {
        var xPos = pStartPoint.x - Math.sin(cc.degreesToRadians(pAngle + 180)) * pRadius;
        var yPos = pStartPoint.y - Math.cos(cc.degreesToRadians(pAngle + 180)) * pRadius;
        return cc.p(xPos,yPos)
    },
    getRandomNumberBetween:function (pMinNum, pMaxNum)
    {
        var toNum = pMaxNum;
        var fromNum = pMinNum;

        var randNum = Math.floor(Math.random() * (toNum - fromNum)) + fromNum;
        return randNum;
    }

});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

