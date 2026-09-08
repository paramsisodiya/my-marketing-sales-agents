import { ITool } from './tool.interface';

export class DocumentGeneratorTool implements ITool {
  public name = 'doc_generator';
  public description = 'Generates clean, branded Markdown and HTML proposals, audit reports, and battlecard documents.';
  public parameters = [
    { name: 'title', type: 'string' as const, description: 'Document title', required: true },
    { name: 'clientName', type: 'string' as const, description: 'Client or prospect name', required: true },
    { name: 'sections', type: 'array' as const, description: 'List of section objects { heading, content }', required: true }
  ];

  public async execute(args: { title: string; clientName: string; sections: Array<{ heading: string; content: string }> }) {
    if (!args.sections || !Array.isArray(args.sections)) {
      return { success: false, error: 'Sections array required' };
    }

    let markdown = `# ${args.title}\n\n**Prepared for**: ${args.clientName}  \n**Prepared by**: PrimeSoul Web Solutions  \n**Generated**: ${new Date().toLocaleDateString()}\n\n---\n\n`;

    for (const sec of args.sections) {
      markdown += `## ${sec.heading}\n\n${sec.content}\n\n`;
    }

    markdown += `\n---\n*Confidential — PrimeSoul Web Solutions*\n`;

    return {
      success: true,
      data: {
        title: args.title,
        clientName: args.clientName,
        markdown,
        characterCount: markdown.length,
      }
    };
  }
}
