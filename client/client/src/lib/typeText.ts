export async function typeText(
  text: string,
  onUpdate: (value: string) => void,
  speed = 12
) {
  let current = "";

  for (let i = 0; i < text.length; i++) {
    current += text[i];
    onUpdate(current);
    await new Promise((r) => setTimeout(r, speed));
  }
}