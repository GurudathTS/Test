/**
 * Created by gurudath on 4/9/17.
 */
var GameOverScreen = cc.Layer.extend({

   mainGameref:null,
    isGameWon:false,

    ctor: function(){
        this._super();
        this.mainGameref=null;
        this.isGameWon = false;

    },
    addUI:function()
    {
        var pDirector = cc.director;
        var visibleSize = pDirector.getVisibleSize();
        var origin = pDirector.getVisibleOrigin();

        //background
        var backGroundSpr = new cc.Sprite(res.GameOver_background_png);
        backGroundSpr.attr({
            x: visibleSize.width / 2 + origin.x,
            y: visibleSize.height / 2 + origin.y
        });
        this.addChild(backGroundSpr);

        var resulttext = "Congratulations \n You have Completed Game";
        if (!this.isGameWon)
            resulttext = "You Lost the Game. Plz try Again.";

        var resultLabel = new cc.LabelTTF(resulttext, "Arial", 34);
        backGroundSpr.addChild(resultLabel);
        resultLabel.x = backGroundSpr.getContentSize().width / 2;
        resultLabel.y = backGroundSpr.getContentSize().height / 1.8;
        resultLabel.color = cc.color(0, 0, 0);
        resultLabel.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        resultLabel.verticalAlign = cc.TEXT_ALIGNMENT_CENTER;

        var retryabel = new cc.LabelTTF("Retry Game", "Arial", 34);
        retryabel.color = cc.color(255, 0, 255);
        var donebutton = new cc.MenuItemLabel(retryabel, function(sender){
            cc.log("Removed");
            this.mainGameref.backfromresultScreen();
            this.removeFromParent(true);
        }, this);
        donebutton.setPosition(cc.p( backGroundSpr.getContentSize().width / 2,backGroundSpr.getContentSize().height / 4));

        var menu = new cc.Menu( donebutton);
        menu.setPosition(cc.p(0,0));
        backGroundSpr.addChild(menu);
    }
});

GameOverScreen.createLayer = function ()
{
    var gameoverlayer = new GameOverScreen();
    if (gameoverlayer.init())
        return gameoverlayer;

    return null;
};
