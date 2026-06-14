import { ContentSanitizer } from '../../../../src/domain/service/ContentSanitizer';
import { ContentBlock, ContentBlockType } from '../../../../src/domain/model/ContentBlock';
import { ValidationResult } from '../../../../src/domain/model/ValidationResult';

describe('ContentSanitizer', () => {

  it('should return VALID when HTML block has balanced tags', () => {
    const sanitizer = new ContentSanitizer();
    const block: ContentBlock = { type: ContentBlockType.HTML, content: '<p>Hola <strong>mundo</strong></p>' };
    expect(sanitizer.validateBlock(block)).toBe(ValidationResult.VALID);
  });

  it('should return MALFORMED_HTML when HTML block has unclosed tag', () => {
    const sanitizer = new ContentSanitizer();
    const block: ContentBlock = { type: ContentBlockType.HTML, content: '<p>Hola <strong>mundo</p>' };
    expect(sanitizer.validateBlock(block)).toBe(ValidationResult.MALFORMED_HTML);
  });

  it('should return MALFORMED_HTML when HTML contains script tag', () => {
    const sanitizer = new ContentSanitizer();
    const block: ContentBlock = { type: ContentBlockType.HTML, content: '<script>alert("xss")</script>' };
    expect(sanitizer.validateBlock(block)).toBe(ValidationResult.MALFORMED_HTML);
  });

  it('should return VALID when HTML block contains self-closing tag', () => {
    const sanitizer = new ContentSanitizer();
    const block: ContentBlock = { type: ContentBlockType.HTML, content: '<p>Salto<br/>de línea</p>' };
    expect(sanitizer.validateBlock(block)).toBe(ValidationResult.VALID);
  });

  it('should return VALID when MARKDOWN block has any content', () => {
    const sanitizer = new ContentSanitizer();
    const block: ContentBlock = { type: ContentBlockType.MARKDOWN, content: '## Título\n\nContenido' };
    expect(sanitizer.validateBlock(block)).toBe(ValidationResult.VALID);
  });

  it('should return INVALID_CONTENT when block content is empty', () => {
    const sanitizer = new ContentSanitizer();
    const block: ContentBlock = { type: ContentBlockType.HTML, content: '' };
    expect(sanitizer.validateBlock(block)).toBe(ValidationResult.INVALID_CONTENT);
  });

  it('should return VALID when IMAGE block has valid https URL', () => {
    const sanitizer = new ContentSanitizer();
    const block: ContentBlock = { type: ContentBlockType.IMAGE, content: 'https://ejemplo.com/foto.jpg' };
    expect(sanitizer.validateBlock(block)).toBe(ValidationResult.VALID);
  });

  it('should return INVALID_CONTENT when IMAGE block has invalid URL', () => {
    const sanitizer = new ContentSanitizer();
    const block: ContentBlock = { type: ContentBlockType.IMAGE, content: 'foto.jpg' };
    expect(sanitizer.validateBlock(block)).toBe(ValidationResult.INVALID_CONTENT);
  });

});