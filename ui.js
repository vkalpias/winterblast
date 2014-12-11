pc.script.create('ui', function (context) {
    // Creates a new Ui instance
    var Ui = function (entity) {
        this.entity = entity;
        this.lifeSlider = null;
    };

    Ui.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.lifeSlider = this.entity.findByName('life').script.progressbar;
            this.remainingEnemies = this.entity.findByName('remaining_enemies').script.font_renderer;
            this.remainingEnemies.entity.enabled = false;
            this.nextWave = this.entity.findByName('wave_start').script.font_renderer;
            this.levelSlider = this.entity.findByName('level_slider').script.progressbar;
            this.level = this.entity.findByName('level').script.font_renderer;
            
            this.intro = this.entity.findByName('intro');
            this.main = this.entity.findByName('ingame');
            this.gameover = this.entity.findByName('gameover');
            
            this.totalTime = this.entity.findByName('total_time').script.font_renderer;
            
            this.buttonMute = this.entity.findByName('mute').script.sprite;
            this.buttonMute.on('click', this.onMute, this);
            
            var buttonShare = this.entity.findByName('share').script.font_renderer;
            buttonShare.on('click', this.onShare, this);
            
            var buttonRestart = this.entity.findByName('restart').script.font_renderer;
            buttonRestart.on('click', this.onRestart, this);
            
            game.on('reset', this.reset, this);
        },
        
        postInitialize: function () {
            game.player.script.player.on('life', this.onLifeChanged, this);
            game.player.script.player.on('xp', this.onXpChanged, this);
            game.player.script.player.on('level', this.onLevelChanged, this);
            game.on('enemyKilled', this.onRemainingEnemies, this);
            game.on('nextWaveTimer', this.onNextWaveTimer, this);
            game.on('nextWave', this.onNextWave, this);
            game.on('gameover', this.onGameover, this);
            this.reset();
            
            this.intro.enabled = true;
            this.main.enabled = false;
            this.gameover.enabled = false;
        },
        
        reset: function () {
            this.levelSlider.setProgress(0);
            this.lifeSlider.setProgress(1);  
            this.level.text = 'LEVEL 1';
            this.gameover.enabled = false;
        },

        onLifeChanged: function (value) {
            this.lifeSlider.setProgress(value);
        },
        
        onXpChanged: function (value, progress) {
            this.levelSlider.setProgress(progress);
        },
        
        onLevelChanged: function (value) {
            this.level.text = 'LEVEL ' + value;
        },
        
        onRemainingEnemies: function (remaining) {
            this.remainingEnemies.entity.enabled = true;
            this.remainingEnemies.text = "Enemies " + remaining;
        },
        
        onNextWaveTimer: function (remainingTime) {
            this.intro.enabled = false;
            this.main.enabled = true;
            this.nextWave.entity.enabled = true;
            this.nextWave.text = 'Next wave in ' + (remainingTime + 1);
        },
        
        onNextWave: function () {
            this.nextWave.text = 'Wave started!';
            this.onRemainingEnemies(game.getRemainingEnemies());
            setTimeout(function () {
                this.nextWave.entity.enabled = false;
            }.bind(this), 1000);
        },
        
        onRestart: function () {
            game.reset();  
        },
        
        onShare: function () {
            window.open(pc.string.format("https://twitter.com/intent/tweet?text=I%20survived%20for%20{0}%20seconds%20in%20%23WinterBlast%20by%20%40vkalpias.%20Beat%20that!%20http://apps.playcanvas.com/vaios/ld31/winterblast", this.secondsToString(game.getTotalTime())));  
        },
        
        onGameover: function () {
            this.gameover.enabled = true;
            this.main.enabled = false;
            this.totalTime.text = this.secondsToString(game.getTotalTime()) + ' sec';
        },
        
        secondsToString: function (time) {
            return Math.round(time).toString();
        },
        
        onMute: function () {
            var toggle = !game.audio.isMuted();
            game.audio.toggleMute(toggle);
            this.buttonMute.tint = toggle ? new pc.Color(0.77, 0.84, 0.97) : new pc.Color(1, 1, 1);
        }
    };

    return Ui;
});