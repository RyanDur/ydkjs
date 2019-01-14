function* range(start, end) {
  yield start;
  if (start === end) return;
  yield* range(start + 1, end);
}
// You Don't Know JS: this & Object Prototypes
// Chapter 1: this Or That?

// this is neither a reference to the function itself, nor is it a reference to the function's lexical scope

// this is actually a binding that is made when a function is invoked, and what it references is determined entirely
// by the call-site where the function is called.

describe('this', () => {
  describe('itself', () => {
    describe('in a function', () => {
      function foo(num) {
        this.count++;
      }

      describe('as a reference', () => {
        beforeEach(() => {
          foo.count = 0;
          [...range(0, 9)].forEach(num => foo(num));
        });

        it('should not see the reference', () => {
          expect(foo.count).toBe(0);
        });

        describe('count', () => {
          it('should be defined globally', () => {
            expect(count).not.toBeUndefined();
          });
          it('should be NaN', () => {
            expect(count).toBeNaN();
          });
        });
      });

      describe('forcing the reference', () => {
        it('should see the reference', () => {
          foo.count = 0;
          [...range(0, 15)].forEach(num => foo.call(foo, num));
          expect(foo.count).toBe(16);
        });
      });

      describe('a workaround ignoring this', () => {
        describe('using lexical scope', () => {
          describe('with a helper object', () => {
            it('should see data', () => {
              const data = {
                count: 0
              };

              function foo(num) {
                // console.log( "foo: " + num );
                data.count++;
              }

              [...range(0, 9)].forEach(num => foo(num));
              expect(data.count).toBe(10);
            });
          });

          describe('with a function object reference', () => {
            it('should see foo', () => {
              function foo(num) {
                // console.log( "foo: " + num );
                foo.count++;
              }

              foo.count = 0;
              [...range(0, 7)].forEach(num => foo(num));
              expect(foo.count).toBe(8);
            });
          });
        });
      });
    });
  });

  describe('its scope', () => {
    it('should not be able to cross over a boundary to refer to another functions lexical scope', () => {
      function bar() {
        return this.ab;
      }

      function foo() {
        const ab = 2;
        return bar();
      }

      expect(foo()).toBeUndefined();
    });
  });
});