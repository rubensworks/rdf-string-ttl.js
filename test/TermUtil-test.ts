import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import * as TermUtil from '..';

const FACTORY = new DataFactory();

describe('TermUtil', () => {
  describe('#getLiteralValue', () => {
    it('should error on invalid literals', async() => {
      expect(() => TermUtil.getLiteralValue('"abc')).toThrow();
    });
  });

  describe('#termToString', () => {
    it('should transform a falsy value', async() => {
      expect(TermUtil.termToString(null)).toBeFalsy();
      /* eslint-disable unicorn/no-useless-undefined */
      expect(TermUtil.termToString(undefined)).toBeFalsy();
      /* eslint-enable unicorn/no-useless-undefined */
    });

    it('should transform a named node', async() => {
      expect(TermUtil.termToString(FACTORY.namedNode('http://example.org'))).toEqual('<http://example.org>');
    });

    it('should transform a named node with dashes', async() => {
      expect(TermUtil.termToString(FACTORY.namedNode('http://this-is-an-example.com')))
        .toEqual('<http://this-is-an-example.com>');
    });

    it('should transform a blank node', async() => {
      expect(TermUtil.termToString(FACTORY.blankNode('b1'))).toEqual('_:b1');
    });

    it('should transform a blank node with special characters without changing them', async() => {
      expect(TermUtil.termToString(FACTORY.blankNode('a\uD835\uDC00test'))).toEqual('_:a\uD835\uDC00test');
    });

    it('should transform a variable', async() => {
      expect(TermUtil.termToString(FACTORY.variable('v1'))).toEqual('?v1');
    });

    it('should transform the default graph', async() => {
      expect(TermUtil.termToString(FACTORY.defaultGraph())).toEqual('');
    });

    it('should transform a literal', async() => {
      expect(TermUtil.termToString(FACTORY.literal('abc'))).toEqual('"abc"');
    });

    it('should transform a literal with quotes', async() => {
      expect(TermUtil.termToString(FACTORY.literal('a"b"c'))).toEqual('"a\\"b\\"c"');
    });

    it('should transform a literal with single quotes', async() => {
      expect(TermUtil.termToString(FACTORY.literal('a\'b\'c'))).toEqual('"a\'b\'c"');
    });

    it('should transform a literal with backslashes', async() => {
      expect(TermUtil.termToString(FACTORY.literal('a\\bc'))).toEqual('"a\\\\bc"');
    });

    it('should transform a literal with a tab character', async() => {
      expect(TermUtil.termToString(FACTORY.literal('a\tbc'))).toEqual('"a\\tbc"');
    });

    it('should transform a literal with a newline character', async() => {
      expect(TermUtil.termToString(FACTORY.literal('a\nbc'))).toEqual('"a\\nbc"');
    });

    it('should transform a literal with a cariage return character', async() => {
      expect(TermUtil.termToString(FACTORY.literal('a\rbc'))).toEqual('"a\\rbc"');
    });

    it('should transform a literal with a backspace character', async() => {
      expect(TermUtil.termToString(FACTORY.literal('a\bbc'))).toEqual('"a\\bbc"');
    });

    it('should transform a literal with a language and direction', async() => {
      expect(TermUtil.termToString(FACTORY.literal('abc', { language: 'en', direction: 'ltr' })))
        .toEqual('"abc"@en--ltr');
    });

    it('should transform a literal with a form feed character', async() => {
      expect(TermUtil.termToString(FACTORY.literal('a\fbc'))).toEqual('"a\\fbc"');
    });

    it('should transform a literal with a line separator', async() => {
      expect(TermUtil.termToString(FACTORY.literal('a\u2028bc'))).toEqual('"a\u2028bc"');
    });

    it('should transform a literal with a paragraph separator', async() => {
      expect(TermUtil.termToString(FACTORY.literal('a\u2029bc'))).toEqual('"a\u2029bc"');
    });

    it('should transform a literal containing special unicode characters', async() => {
      expect(TermUtil.termToString(FACTORY.literal('a\u0000\u0001bc'))).toEqual('"a\\u0000\\u0001bc"');
    });

    it('should transform a literal containing surrogate pairs', async() => {
      expect(TermUtil.termToString(FACTORY.literal('test 😀 test'))).toEqual('"test \\U0001f600 test"');
    });

    it('should transform a literal with a language', async() => {
      expect(TermUtil.termToString(FACTORY.literal('abc', 'en'))).toEqual('"abc"@en');
    });

    it('should transform a literal with a datatype', async() => {
      expect(TermUtil.termToString(FACTORY.literal('abc', FACTORY.namedNode('http://ex'))))
        .toEqual('"abc"^^<http://ex>');
    });

    it('should transform a quad with non-default graph', async() => {
      expect(TermUtil.termToString(FACTORY.quad(
        FACTORY.namedNode('ex:s'),
        FACTORY.namedNode('ex:p'),
        FACTORY.namedNode('ex:o'),
        FACTORY.namedNode('ex:g'),
      ))).toEqual('<<<ex:s> <ex:p> <ex:o> <ex:g>>>');
    });

    it('should transform a quad with default graph', async() => {
      expect(TermUtil.termToString(FACTORY.quad(
        FACTORY.namedNode('ex:s'),
        FACTORY.namedNode('ex:p'),
        FACTORY.namedNode('ex:o'),
      ))).toEqual('<<<ex:s> <ex:p> <ex:o>>>');
    });

    it('should transform a nested quad', async() => {
      expect(TermUtil.termToString(FACTORY.quad(
        FACTORY.quad(
          FACTORY.namedNode('ex:s'),
          FACTORY.namedNode('ex:p'),
          FACTORY.namedNode('ex:o'),
        ),
        FACTORY.namedNode('ex:p'),
        FACTORY.namedNode('ex:o'),
      ))).toEqual('<<<<<ex:s> <ex:p> <ex:o>>> <ex:p> <ex:o>>>');
    });

    it('should be usable within a map operation on generic term types', async() => {
      const terms: RDF.Term[] = [
        FACTORY.namedNode('http://example.org/a'),
        FACTORY.namedNode('http://example.org/b'),
      ];
      const stringTerms: (string | undefined)[] = terms.map(term => TermUtil.termToString(term));
      expect(stringTerms).toEqual([ '<http://example.org/a>', '<http://example.org/b>' ]);
    });

    it('should be usable within a map operation on specific term types', async() => {
      const terms: RDF.NamedNode[] = [
        FACTORY.namedNode('http://example.org/a'),
        FACTORY.namedNode('http://example.org/b'),
      ];
      const stringTerms: (string | undefined)[] = terms.map(term => TermUtil.termToString(term));
      expect(stringTerms).toEqual([ '<http://example.org/a>', '<http://example.org/b>' ]);
    });

    it('should be usable within a map operation on null', async() => {
      const terms: null[] = [ null, null ];
      const stringTerms: (string | undefined)[] = terms.map(term => TermUtil.termToString(term));
      expect(stringTerms).toEqual([ undefined, undefined ]);
    });

    it('should be usable within a map operation on undefined', async() => {
      const terms: undefined[] = [ undefined, undefined ];
      const stringTerms: (string | undefined)[] = terms.map(term => TermUtil.termToString(term));
      expect(stringTerms).toEqual([ undefined, undefined ]);
    });

    it('should be usable within a map operation on null and undefined', async() => {
      const terms: (null | undefined)[] = [ null, undefined ];
      const stringTerms: (string | undefined)[] = terms.map(term => TermUtil.termToString(term));
      expect(stringTerms).toEqual([ undefined, undefined ]);
    });

    it('should be usable within a map operation on terms and undefined', async() => {
      const terms: (RDF.NamedNode | undefined)[] = [ FACTORY.namedNode('http://example.org/a'), undefined ];
      const stringTerms: (string | undefined)[] = terms.map(term => TermUtil.termToString(term));
      expect(stringTerms).toEqual([ '<http://example.org/a>', undefined ]);
    });
  });

  describe('#getLiteralType', () => {
    it('should error on invalid literal types', async() => {
      expect(() => TermUtil.getLiteralType('"abc"h')).toThrow();
    });
  });

  describe('#getLiteralLanguage', () => {
    it('should error on invalid languages', async() => {
      expect(() => TermUtil.getLiteralLanguage('"abc"@')).toThrow();
    });
  });

  describe('#getLiteralDirection', () => {
    it('should error on invalid directions', async() => {
      expect(() => TermUtil.getLiteralDirection('"abc"@en--bla')).toThrow();
    });
  });

  describe('#stringToTerm', () => {
    it('should transform an empty string to default graph', async() => {
      expect(TermUtil.stringToTerm('')).toEqual(FACTORY.defaultGraph());
    });

    it('should transform a blank node', async() => {
      expect(TermUtil.stringToTerm('_:b1')).toEqual(FACTORY.blankNode('b1'));
    });

    it('should transform a variable', async() => {
      expect(TermUtil.stringToTerm('?v1')).toEqual(FACTORY.variable('v1'));
    });

    it('should transform a literal', async() => {
      expect(TermUtil.stringToTerm('"abc"').equals(FACTORY.literal('abc'))).toBeTruthy();
    });

    it('should transform a literal with escaped quotes', async() => {
      expect(TermUtil.stringToTerm('"a\\"b\\"c"').equals(FACTORY.literal('a"b"c'))).toBeTruthy();
    });

    it('should transform a literal with a datatype', async() => {
      expect(TermUtil.stringToTerm('"abc"^^<http://blabla>')
        .equals(FACTORY.literal('abc', FACTORY.namedNode('http://blabla')))).toBeTruthy();
    });

    it('should transform a literal with a datatype incorrectly', async() => {
      expect(TermUtil.stringToTerm('"abc"^^<http://blabla>')
        .equals(FACTORY.literal('abc'))).toBeFalsy();
    });

    it('should transform a literal with a language', async() => {
      expect(TermUtil.stringToTerm('"abc"@en').equals(FACTORY.literal('abc', 'en'))).toBeTruthy();
    });

    it('should transform a literal with a language incorrectly', async() => {
      expect(TermUtil.stringToTerm('"abc"@en').equals(FACTORY.literal('abc'))).toBeFalsy();
    });

    it('should transform a literal with a language and direction', async() => {
      expect(TermUtil.stringToTerm('"abc"@en--ltr')
        .equals(FACTORY.literal('abc', { language: 'en', direction: 'ltr' }))).toBeTruthy();
      expect(TermUtil.stringToTerm('"abc"@en-us--ltr')
        .equals(FACTORY.literal('abc', { language: 'en-us', direction: 'ltr' }))).toBeTruthy();
      expect(TermUtil.stringToTerm('"---"@en-us--ltr')
        .equals(FACTORY.literal('---', { language: 'en-us', direction: 'ltr' }))).toBeTruthy();
    });

    it('should transform a literal with a language and direction incorrectly', async() => {
      expect(TermUtil.stringToTerm('"abc"@en--ltr')
        .equals(FACTORY.literal('abc', { language: 'en', direction: 'rtl' }))).toBeFalsy();
      expect(TermUtil.stringToTerm('"abc"@en-us--ltr')
        .equals(FACTORY.literal('abc', { language: 'en-us', direction: 'rtl' }))).toBeFalsy();
    });

    it('should transform a default graph', async() => {
      expect(TermUtil.stringToTerm('')).toEqual(FACTORY.defaultGraph());
    });

    it('should transform a named node', async() => {
      expect(TermUtil.stringToTerm('<http://example.org>')).toEqual(FACTORY.namedNode('http://example.org'));
    });

    it('should error a named node without <', async() => {
      expect(() => TermUtil.stringToTerm('http://example.org>'))
        .toThrow(new Error('Detected invalid iri for named node (must be wrapped in <>): http://example.org>'));
    });

    it('should error a named node without >', async() => {
      expect(() => TermUtil.stringToTerm('<http://example.org'))
        .toThrow(new Error('Detected invalid iri for named node (must be wrapped in <>): <http://example.org'));
    });

    describe('with a custom data factory', () => {
      it('should transform an empty string to default graph', async() => {
        expect(TermUtil.stringToTerm('', FACTORY)).toEqual(FACTORY.defaultGraph());
      });

      it('should transform a blank node', async() => {
        expect(TermUtil.stringToTerm('_:b1', FACTORY)).toEqual(FACTORY.blankNode('b1'));
      });

      it('should transform a variable', async() => {
        expect(TermUtil.stringToTerm('?v1', FACTORY)).toEqual(FACTORY.variable('v1'));
      });

      it('should throw on transforming a variable when the factory has no variable method', async() => {
        const dataFactory: RDF.DataFactory = <any> {};
        expect(() => TermUtil.stringToTerm('?v1', dataFactory))
          .toThrow(new Error('Missing \'variable()\' method on the given DataFactory'));
      });

      it('should transform a literal', async() => {
        expect(TermUtil.stringToTerm('"abc"', FACTORY).equals(FACTORY.literal('abc'))).toBeTruthy();
      });

      it('should transform a literal with a datatype', async() => {
        const typedDataFactory: RDF.DataFactory<RDF.Quad> = FACTORY;

        expect(TermUtil.stringToTerm('"abc"^^<http://blabla>', typedDataFactory)
          .equals(FACTORY.literal('abc', FACTORY.namedNode('http://blabla')))).toBeTruthy();
      });

      it('should transform a literal with a datatype incorrectly', async() => {
        expect(TermUtil.stringToTerm('"abc"^^<http://blabla>', FACTORY)
          .equals(FACTORY.literal('abc'))).toBeFalsy();
      });

      it('should transform a literal with a language', async() => {
        expect(TermUtil.stringToTerm('"abc"@en', FACTORY).equals(FACTORY.literal('abc', 'en'))).toBeTruthy();
      });

      it('should transform a literal with a language incorrectly', async() => {
        expect(TermUtil.stringToTerm('"abc"@en', FACTORY).equals(FACTORY.literal('abc'))).toBeFalsy();
      });

      it('should transform a default graph', async() => {
        expect(TermUtil.stringToTerm('', FACTORY)).toEqual(FACTORY.defaultGraph());
      });

      it('should transform a named node', async() => {
        expect(TermUtil.stringToTerm('<http://example.org>', FACTORY))
          .toEqual(FACTORY.namedNode('http://example.org'));
      });

      it('should transform a quad with graph', async() => {
        expect(TermUtil.stringToTerm('<<<ex:s> <ex:p> <ex:o> <ex:g>>>', FACTORY))
          .toEqual(FACTORY.quad(
            FACTORY.namedNode('ex:s'),
            FACTORY.namedNode('ex:p'),
            FACTORY.namedNode('ex:o'),
            FACTORY.namedNode('ex:g'),
          ));
      });

      it('should transform a quad with default graph', async() => {
        expect(TermUtil.stringToTerm('<<<ex:s> <ex:p> <ex:o>>>', FACTORY))
          .toEqual(FACTORY.quad(
            FACTORY.namedNode('ex:s'),
            FACTORY.namedNode('ex:p'),
            FACTORY.namedNode('ex:o'),
          ));
      });

      it('should transform a nested quad', async() => {
        expect(TermUtil.stringToTerm('<<<<<ex:s> <ex:p> <ex:o>>> <ex:p> <ex:o>>>', FACTORY))
          .toEqual(FACTORY.quad(
            FACTORY.quad(
              FACTORY.namedNode('ex:s'),
              FACTORY.namedNode('ex:p'),
              FACTORY.namedNode('ex:o'),
            ),
            FACTORY.namedNode('ex:p'),
            FACTORY.namedNode('ex:o'),
          ));
      });

      it('should transform nested quads', async() => {
        expect(TermUtil.stringToTerm('<<<<<ex:s> <ex:p> <ex:o>>> <ex:p> <<<ex:s> <ex:p> <ex:o>>>>>', FACTORY))
          .toEqual(FACTORY.quad(
            FACTORY.quad(
              FACTORY.namedNode('ex:s'),
              FACTORY.namedNode('ex:p'),
              FACTORY.namedNode('ex:o'),
            ),
            FACTORY.namedNode('ex:p'),
            FACTORY.quad(
              FACTORY.namedNode('ex:s'),
              FACTORY.namedNode('ex:p'),
              FACTORY.namedNode('ex:o'),
            ),
          ));
      });

      it('should error on a quad with incorrect inner tags', async() => {
        expect(() => TermUtil.stringToTerm('<<<>>', FACTORY))
          .toThrow(new Error('Found opening tag without closing tag in <<<>>'));
      });

      it('should error on a quad with incorrect inner tags 2', async() => {
        expect(() => TermUtil.stringToTerm('<<>>>', FACTORY))
          .toThrow(new Error('Found closing tag without opening tag in <<>>>'));
      });

      it('should error on a quad with incorrect term count', async() => {
        expect(() => TermUtil.stringToTerm('<<a b>>', FACTORY))
          .toThrow(new Error('Nested quad syntax error <<a b>>'));
      });
    });
  });

  describe('#stringQuadToQuad', () => {
    it('should transform a string triple to a triple', async() => {
      expect(TermUtil.stringQuadToQuad({
        object: '"literal"',
        predicate: '<http://example.org/p>',
        subject: '<http://example.org>',
      }).equals(FACTORY.quad(
        FACTORY.namedNode('http://example.org'),
        FACTORY.namedNode('http://example.org/p'),
        FACTORY.literal('literal'),
      ))).toBeTruthy();
    });

    it('should transform a string quad to a quad', async() => {
      expect(TermUtil.stringQuadToQuad({
        graph: '<http://example.org/graph>',
        object: '"literal"',
        predicate: '<http://example.org/p>',
        subject: '<http://example.org>',
      }).equals(FACTORY.quad(
        FACTORY.namedNode('http://example.org'),
        FACTORY.namedNode('http://example.org/p'),
        FACTORY.literal('literal'),
        FACTORY.namedNode('http://example.org/graph'),
      ))).toBeTruthy();
    });

    describe('with a custom data factory', () => {
      it('should transform a string triple to a triple', async() => {
        expect(TermUtil.stringQuadToQuad({
          object: '"literal"',
          predicate: '<http://example.org/p>',
          subject: '<http://example.org>',
        }, FACTORY).equals(FACTORY.quad(
          FACTORY.namedNode('http://example.org'),
          FACTORY.namedNode('http://example.org/p'),
          FACTORY.literal('literal'),
        ))).toBeTruthy();
      });

      it('should transform a string quad to a quad', async() => {
        expect(TermUtil.stringQuadToQuad({
          graph: '<http://example.org/graph>',
          object: '"literal"',
          predicate: '<http://example.org/p>',
          subject: '<http://example.org>',
        }, FACTORY).equals(FACTORY.quad(
          FACTORY.namedNode('http://example.org'),
          FACTORY.namedNode('http://example.org/p'),
          FACTORY.literal('literal'),
          FACTORY.namedNode('http://example.org/graph'),
        ))).toBeTruthy();
      });
    });
  });

  describe('#quadToStringQuad', () => {
    it('should transform a triple to a string triple', async() => {
      expect(TermUtil.quadToStringQuad(FACTORY.quad(
        FACTORY.namedNode('http://example.org'),
        FACTORY.namedNode('http://example.org/p'),
        FACTORY.literal('literal'),
      ))).toEqual({
        graph: '',
        object: '"literal"',
        predicate: '<http://example.org/p>',
        subject: '<http://example.org>',
      });
    });

    it('should transform a quad to a string quad', async() => {
      expect(TermUtil.quadToStringQuad(FACTORY.quad(
        FACTORY.namedNode('http://example.org'),
        FACTORY.namedNode('http://example.org/p'),
        FACTORY.literal('literal'),
        FACTORY.namedNode('http://example.org/graph'),
      ))).toEqual({
        graph: '<http://example.org/graph>',
        object: '"literal"',
        predicate: '<http://example.org/p>',
        subject: '<http://example.org>',
      });
    });
  });
});
