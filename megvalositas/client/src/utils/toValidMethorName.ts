export function toValidMethodName(str: string): string {
    let name = str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "_");
    if (/^[0-9]/.test(name)) {
      name = "_" + name;
    }
    return name.charAt(0).toLowerCase() + name.slice(1);
  }
  