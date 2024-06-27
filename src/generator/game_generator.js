const AbstractGenerator = require('./abstract_generator');

class GameGenerator extends AbstractGenerator {
  tableName = "Games";

  // async execute() {
  //   await this.save(this.getSaveParams({prompt: this.prompt}));
  // }

  getSaveParams() {
    return {
      prompt: this.prompt
    }
  }
}

module.exports = GameGenerator;
