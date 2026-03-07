
conteúdo:

```markdown
# Menu Visibility Strategy

Menu rendering is permission-driven.

Each menu item declares the permission required to be visible.

Example:

```ts
{
  key: "customers",
  label: "Clientes",
  perm: "customers.read",
  path: "/cadastros/clientes"
}