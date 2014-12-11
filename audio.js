pc.script.create('audio', function (context) {
    // Creates a new Audio instance
    var Audio = function (entity) {
        this.entity = entity;
        this.sources = [];
        this.lastUsedSource = 0;
        this.isPlayingDamage = false;
        this.isOver = false;
        this.muted = false;
        this.registeredSources = [];
    };

    Audio.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            var source = this.entity.findByName('2d');
            this.sources.push(source.audiosource);
            this.registerSource(source.audiosource);
            for (var i = 0; i < 6; i++) {
                var clone = source.clone();
                this.sources.push(clone.audiosource);
                this.registerSource(clone.audiosource);
                this.entity.addChild(clone);
            }
            
            this.gameOverSource = this.entity.findByName('music_gameover').audiosource;
            this.musicSource = this.entity.findByName('music_main').audiosource;
            
            game.audio = this;
            
            game.on('nextWaveTimer', this.onCountdown, this);
            game.on('nextWave', this.onWaveStart, this);
            game.on('enemyKilled', this.onKill, this);
            game.on('gameover', this.onGameover, this);
            game.on('reset', this.onRestart, this);
            
            game.player.script.player.on('life', this.onLifeChanged, this);
            game.player.on('shoot', this.onPlayerShoot, this);  
        },
        
        play: function (name) {
            var source = this.getFreeAudioSource();
            source.play(name);
        },
        
        onCountdown: function () {
            this.play('countdown');
        },
        
        onWaveStart: function () {
            this.play('start_wave');
        },
        
        onPlayerShoot: function () {
            this.play('shoot');
        },
        
        onKill: function () {
            this.play('enemy_dead_1');
        },
        
        onGameover: function () {
            this.isOver = true;
            this.musicSource.stop();
            this.gameOverSource.play('gameover');  
        },
        
        onRestart: function () {
            this.isOver = false;
            this.gameOverSource.stop();  
            this.musicSource.play('main');
        },
        
        onLifeChanged: function (value, diff) {
            if (this.isOver) {
                return;
            }
            
            if (diff < 0) {
              if (!this.isPlayingDamage) {
                  this.isPlayingDamage = true;
                  this.play('damage');
                  setTimeout(function (){
                      this.isPlayingDamage = false;
                  }.bind(this), 1000);
              }
            } else {
                this.play('health_powerup');
            }
        },
        
        getFreeAudioSource: function () {
            var i = (this.lastUsedSource + 1) % this.sources.length;
            this.lastUsedSource = i;
            return this.sources[i];
        },
        
        isMuted: function () {
            return this.muted;
        },
        
        toggleMute: function (toggle) {
            if (this.muted !== toggle) {
                this.muted = toggle;
                
                for (var i=0; i<this.registeredSources.length; i++) {
                    this.registeredSources[i].enabled = !toggle;
                }
            }
        },
        
        registerSource: function (source) {
            this.registeredSources.push(source);
        },
        
        unregisterSource: function (source) {
            var i = this.registeredSources.indexOf(source);
            if (i >= 0) {
                this.registeredSources.splice(i, 1);
            }
        },
        
    };

    return Audio;
});