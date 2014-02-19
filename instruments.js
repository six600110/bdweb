function BassDrum(context, options) {
  this.options = options
  this.osc = context.createOscillator();
  this.osc.frequency.value = options.frequency;
  this.osc.type = this.osc.SINE
  this.osc.start(0);

  //envelope with 0.001 sec attack and 0.5 sec decay
  this.envelope = context.createEnvelope(options.att, options.dec,
   options.sus, options.rel);

  this.compressor = context.createDynamicsCompressor();

  this.freq = context.createGain();
  var now = context.currentTime;
  var freq = this.freq;
  freq.connect(this.osc.frequency);
  freq.gain.cancelScheduledValues(now);
  freq.gain.setValueAtTime(options.frequency*2, now);
  freq.gain.linearRampToValueAtTime(options.frequency, now + options.att);

  this.g = context.createGain();
  this.g.gain.value = 1;
  this.osc.connect(this.g);
  this.g.connect(this.envelope);
  this.envelope.connect(compressor);
}

BassDrum.prototype.trigger = function(){
  this.envelope.trigger(this.options.dur);
  var self = this;
  setTimeout(function() { self.osc.stop(0) }, 1000);
}

BassDrum.prototype.connect = function(dest){
  //this.envelope.connect(dest);
  this.compressor.connect(dest);
}

/*
Sine Wave Generator for Web Audio API.
Currently works on Chrome.

Mohit Cheppudira - http://0xfe.blogspot.com
*/

/* Create a generator for the given AudioContext. */
SineWave = function(context) {
  this.context = context;
  this.frequency = 440;
  this.amplitude = 0.1;
  this.playing = false;
  this.osc = this.context.createOscillator();
  this.gain = this.context.createGain();
  this.gain.gain.value = 0;
  this.osc.connect(this.gain);
  this.osc.start(0);
  this.fmosc = this.context.createOscillator();
  this.fmosc.frequency.value = 5;
  this.fmosc.start(0);
  this.fmgain = this.context.createGain();
  this.fmgain.gain.value = this.osc.frequency.value * 0.015;
  this.fmosc.connect(this.fmgain);
  this.fmgain.connect(this.osc.frequency);
}

SineWave.prototype.setAmplitude = function(amplitude) {
  this.amplitude = amplitude;
}

SineWave.prototype.setFrequency = function(freq) {
  this.frequency = freq;
  if (this.osc) this.osc.frequency.value = this.frequency;
}

SineWave.prototype.play = function() {
  if (!this.playing) {
    this.osc.frequency.value = this.frequency;
    this.gain.gain.setValueAtTime(0, this.context.currentTime);
    this.gain.gain.linearRampToValueAtTime(this.amplitude*1.5, 0.001 + this.context.currentTime);
    this.gain.gain.linearRampToValueAtTime(this.amplitude,  0.1 + this.context.currentTime);
    this.playing = true;
  }
}

SineWave.prototype.pause = function() {
  if (this.playing) {
    var delay = 0.1;
    var release = 1.50;
    this.gain.gain.cancelScheduledValues(this.context.currentTime);
    this.gain.gain.value = this.amplitude;
    this.gain.gain.setValueAtTime(this.amplitude, 0.001 + this.context.currentTime);
    this.gain.gain.setTargetAtTime(0, this.context.currentTime+0.01, release);
    var self = this;
    setTimeout(function() { self.fmosc.stop(0); self.osc.stop(0); }, 10*release*1000);
    this.playing = false;
  }
}

SineWave.prototype.getOutNode = function() {
  return this.gain;
}
