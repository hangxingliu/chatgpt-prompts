export function getMarkdownFromGPTJSON(session: any): string {
  const markdown: string[] = [];
  const meta: string[] = [];
  let model = new Set<string>();

  const getResult = () => {
    if (model.size > 0) meta.push(`Model: ${Array.from(model).join(", ")}`);
    let frontmatter = meta.length > 0 ? meta.join("\n") : "";
    if (frontmatter) frontmatter = `---\n${frontmatter}\n---\n`;
    return frontmatter + markdown.join("\n");
  };
  if (!session) return getResult();

  if (session.create_time) {
    const v = session.create_time;
    const date = new Date(v * 1000);
    meta.push(`CreateTime: ${isNaN(date.getTime()) ? v : date.toJSON()}`);
  }

  if (session.update_time) {
    const v = session.update_time;
    const date = new Date(v * 1000);
    meta.push(`UpdateTime: ${isNaN(date.getTime()) ? v : date.toJSON()}`);
  }

  if (session.title) markdown.push(`# ${session.title}\n`);

  if (session.mapping) {
    const items = Object.entries(session.mapping)
      .filter(([key, value]) => {
        if (!(value as any)?.message?.content) return false;
        const text = (value as any).message.content.parts.join("");
        if (!text) return false;
        return true;
      })
      .sort((a, b) => {
        const aV: any = a[1];
        const bV: any = b[1];
        if (!aV?.create_time) return 1;
        if (!bV?.create_time) return 1;
        return aV.create_time - bV.create_time;
      })
      .map((it) => it[1]);

    for (let i = 0; i < items.length; i++) {
      const { message } = items[i] as any;
      const role = message.author?.role;
      let sender: string = role;
      if (role === "assistant") {
        sender = "ChatGPT";
      } else if (role === "user") {
        sender = "You";
      }

      const v = session.update_time;
      const date = new Date(v * 1000);
      const dateStr = isNaN(date.getTime()) ? v : date.toLocaleString();

      const text = message.content.parts.join("\n");
      const _model: string = message.metadata?.model_slug;
      if (_model) model.add(_model);

      markdown.push(`## ${sender}\n`);
      markdown.push(`*at ${dateStr}*\n`);
      markdown.push(text + "\n");
    }
  }

  return getResult();
}
