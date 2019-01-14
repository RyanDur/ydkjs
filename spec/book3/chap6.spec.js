describe('Behavior Delegation', () => {
  describe('OO vs OLOO', () => {
    function Foo_OOStyle(who) {
      this.me = who;
    }

    Foo_OOStyle.prototype.identify = function () {
      return 'I am ' + this.me;
    };

    function Bar_OOStyle(who) {
      Foo_OOStyle.call(this, who);
    }

    Bar_OOStyle.prototype = Object.create(Foo_OOStyle.prototype);

    Bar_OOStyle.prototype.speak = function () {
      return 'Hello, ' + this.identify() + '.';
    };

    const Foo_OLOOStyle = {
      init: function (who) {
        this.me = who;
      },
      identify: function () {
        return 'I am ' + this.me;
      }
    };

    const Bar_OLOOStyle = Object.create(Foo_OLOOStyle);

    Bar_OLOOStyle.speak = function () {
      return 'Hello, ' + this.identify() + '.';
    };

    const b1_OOStyle = new Bar_OOStyle('b1');
    const b2_OOStyle = new Bar_OOStyle('b2');

    const b1_OLOOStyle = Object.create(Bar_OLOOStyle);
    b1_OLOOStyle.init('b1');
    const b2_OLOOStyle = Object.create(Bar_OLOOStyle);
    b2_OLOOStyle.init('b2');

    it('should behave the same', () => {
      expect(b1_OOStyle.speak === b1_OLOOStyle.speak());
      expect(b2_OOStyle.speak === b2_OLOOStyle.speak());
    });
  });
});