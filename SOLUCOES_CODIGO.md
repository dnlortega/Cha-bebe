# 🔨 Soluções de Código - Pronto para Implementar

## 1. AdminSidebar.tsx - Correções

### Correção 1.1: Dropdown Menu Width
**ANTES:**
```tsx
<DropdownMenuContent align={showLabels ? "center" : "start"} 
  side={showLabels ? "bottom" : "right"} 
  className="w-56 z-[70] mb-2 ml-2 shadow-xl border-primary/10">
```

**DEPOIS:**
```tsx
<DropdownMenuContent align={showLabels ? "center" : "start"} 
  side={showLabels ? "bottom" : "right"} 
  className="w-56 max-w-[calc(100vw-1rem)] z-[70] mb-2 ml-2 shadow-xl border-primary/10">
```

---

### Correção 1.3: Mobile Bottom Nav Safe Area
**ANTES:**
```tsx
{/* Mobile bottom navigation */}
<nav className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-primary/5 z-50 flex justify-around py-2">
  {visibleMenuItems.map((item) => (
    // items...
  ))}
</nav>
```

**DEPOIS:**
```tsx
{/* Mobile bottom navigation */}
<nav className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-primary/5 z-50 flex justify-around py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
  {visibleMenuItems.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setIsOpen(false)}
      className={cn("flex flex-col items-center justify-center py-1 px-2 min-h-[44px]", isActive ? "text-primary" : "text-stone-500")}
      title={item.title}
    >
      <item.icon className="h-6 w-6" />
    </Link>
  ))}
  {/* Avatar button (logout) */}
  <button onClick={handleLogout} className="flex flex-col items-center justify-center py-1 px-2 min-h-[44px]" title="Conta">
    {/* ... */}
  </button>
</nav>
```

---

## 2. EventsList.tsx - Correções

### Correção 2.1: Remover Widths Fixas em Grid
**ANTES:**
```tsx
<div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 bg-stone-50 border-b border-stone-100 text-[9px] font-bold tracking-[0.3em] uppercase text-stone-400">
  <span>Evento</span>
  <span className="text-center w-28">Resumo</span>
  <span className="text-right w-52">Ações</span>
</div>
```

**DEPOIS:**
```tsx
<div className="hidden sm:grid sm:grid-cols-[1.5fr_auto_auto] md:grid-cols-[2fr_120px_140px] gap-3 sm:gap-4 px-3 sm:px-5 py-3 bg-stone-50 border-b border-stone-100 text-[9px] font-bold tracking-[0.3em] uppercase text-stone-400">
  <span>Evento</span>
  <span className="text-center text-xs">Resumo</span>
  <span className="text-right text-xs">Ações</span>
</div>
```

---

### Correção 2.2: Email Compartilhado com Truncate
**ANTES:**
```tsx
<div className="flex flex-wrap gap-1.5 pt-2">
  {shares.map((s) => (
    <span key={s.email} className="inline-flex items-center gap-1 bg-primary/5 border border-primary/10 px-2 py-0.5 text-[10px] text-stone-600">
      {s.email}
      <button type="button" disabled={removing === s.email} onClick={() => handleRemoveShare(s.email)} className="text-stone-400 hover:text-red-600" aria-label={`Remover ${s.email}`}>
        {removing === s.email ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
      </button>
    </span>
  ))}
</div>
```

**DEPOIS:**
```tsx
<div className="flex flex-wrap gap-1.5 pt-2">
  {shares.map((s) => (
    <span key={s.email} className="inline-flex items-center gap-1 bg-primary/5 border border-primary/10 px-2 py-0.5 text-[10px] text-stone-600 min-w-0">
      <span className="truncate">{s.email}</span>
      <button type="button" disabled={removing === s.email} onClick={() => handleRemoveShare(s.email)} className="text-stone-400 hover:text-red-600 flex-shrink-0" aria-label={`Remover ${s.email}`}>
        {removing === s.email ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
      </button>
    </span>
  ))}
</div>
```

---

### Correção 2.3: Resumo Info Sem Width Fixo
**ANTES:**
```tsx
<div className="flex sm:flex-col gap-3 sm:gap-1 sm:w-28 sm:items-center text-[10px] text-stone-500">
  <span className="inline-flex items-center gap-1">
    <Users className="h-3 w-3" />
    {guestCount} convidados
  </span>
  <span className="inline-flex items-center gap-1">
    <Gift className="h-3 w-3" />
    {giftCount} presentes
  </span>
</div>
```

**DEPOIS:**
```tsx
<div className="flex sm:flex-col gap-2 sm:gap-1 sm:w-auto sm:min-w-[110px] md:min-w-[130px] sm:items-center text-[10px] text-stone-500">
  <span className="inline-flex items-center gap-1 whitespace-nowrap">
    <Users className="h-3 w-3 flex-shrink-0" />
    <span className="truncate">{guestCount} convidados</span>
  </span>
  <span className="inline-flex items-center gap-1 whitespace-nowrap">
    <Gift className="h-3 w-3 flex-shrink-0" />
    <span className="truncate">{giftCount} presentes</span>
  </span>
</div>
```

---

### Correção 2.4: Ações Sem Width Fixo
**ANTES:**
```tsx
<div className="flex flex-wrap gap-2 sm:justify-end sm:w-52">
  {isOwner && (
    <>
      <ShareEventDialog ... />
      <Button type="button" onClick={handleDeleteEvent} disabled={deleting} ... />
    </>
  )}
  <Button type="button" onClick={() => onEnter(event.id)} ... />
</div>
```

**DEPOIS:**
```tsx
<div className="flex flex-wrap gap-1.5 sm:gap-2 sm:justify-end sm:w-auto md:min-w-[160px] flex-shrink-0">
  {isOwner && (
    <>
      <ShareEventDialog ... />
      <Button type="button" onClick={handleDeleteEvent} disabled={deleting} className="rounded-none h-9 w-9 p-0 flex items-center justify-center flex-shrink-0" title="Excluir" />
    </>
  )}
  <Button type="button" onClick={() => onEnter(event.id)} className="rounded-none h-9 w-9 p-0 flex items-center justify-center flex-shrink-0" title="Entrar" />
</div>
```

---

### Correção 2.5: Linha com Padding Mobile
**ANTES:**
```tsx
<li className="p-5 sm:grid sm:grid-cols-[1fr_auto_auto] sm:gap-4 sm:items-center space-y-4 sm:space-y-0">
```

**DEPOIS:**
```tsx
<li className="p-3 xs:p-4 sm:p-5 sm:grid sm:grid-cols-[1fr_auto_auto] sm:gap-4 sm:items-center space-y-3 sm:space-y-0">
```

---

## 3. admin/page.tsx - Correções

### Correção 3.1: Header Spacing
**ANTES:**
```tsx
<header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-primary/10 pb-8 relative z-10">
```

**DEPOIS:**
```tsx
<header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 xs:gap-4 sm:gap-6 border-b border-primary/10 pb-4 xs:pb-6 sm:pb-8 relative z-10">
```

---

### Correção 3.2: Grid Responsivo
**ANTES:**
```tsx
<div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
  <motion.div variants={itemVariants} className="xl:col-span-1">
    <Card className="... p-10 ... h-full">
      {/* Circular Progress */}
    </Card>
  </motion.div>

  <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
    {/* 6 Cards */}
  </div>
</div>
```

**DEPOIS:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 relative z-10">
  <motion.div variants={itemVariants} className="md:col-span-1">
    <Card className="... p-8 md:p-10 ... h-full">
      {/* Circular Progress - menor em mobile */}
    </Card>
  </motion.div>

  <div className="md:col-span-2 grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 md:gap-6">
    {/* 6 Cards - responsivos */}
  </div>
</div>
```

---

### Correção 3.3: Card Padding
**ANTES:**
```tsx
<Card className="h-full border shadow-sm hover:shadow-xl rounded-3xl bg-white/70 backdrop-blur-md p-6 md:p-8 flex flex-col justify-between gap-6 group transition-all duration-300 cursor-pointer select-none relative overflow-hidden">
```

**DEPOIS:**
```tsx
<Card className="h-full border shadow-sm hover:shadow-xl rounded-3xl bg-white/70 backdrop-blur-md p-3 xs:p-4 sm:p-6 md:p-8 flex flex-col justify-between gap-3 xs:gap-4 sm:gap-6 group transition-all duration-300 cursor-pointer select-none relative overflow-hidden">
```

---

### Correção 3.4: Lista Detalhes Grid
**ANTES:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
```

**DEPOIS:**
```tsx
<div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 xs:gap-3 sm:gap-3 md:gap-4 max-h-[400px] overflow-y-auto overflow-x-hidden pr-1 xs:pr-2 custom-scrollbar">
```

---

### Correção 3.5: Botão Fechar
**ANTES:**
```tsx
<button onClick={() => setSelectedCategory(null)} className="text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:text-red-500 flex items-center gap-2 transition-colors bg-stone-100 hover:bg-red-50 px-4 py-2 rounded-xl">
  <XCircle className="h-4 w-4" /> <span className="hidden sm:inline">Fechar</span>
</button>
```

**DEPOIS:**
```tsx
<button 
  onClick={() => setSelectedCategory(null)} 
  className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-stone-400 hover:text-red-500 flex items-center justify-center gap-2 transition-colors bg-stone-100 hover:bg-red-50 px-2 xs:px-3 sm:px-4 py-2 rounded-xl min-h-[44px] min-w-[44px]"
  title="Fechar lista"
>
  <XCircle className="h-4 w-4 flex-shrink-0" /> 
  <span className="hidden sm:inline">Fechar</span>
</button>
```

---

## 4. admin/events/page.tsx - Correções

### Correção 4.1: Container Padding
**ANTES:**
```tsx
<div className="max-w-5xl mx-auto space-y-10">
```

**DEPOIS:**
```tsx
<div className="max-w-5xl mx-auto space-y-6 xs:space-y-8 sm:space-y-10 px-4 xs:px-5 sm:px-6">
```

---

### Correção 4.3: Header Spacing
**ANTES:**
```tsx
<header className="border-b border-primary/10 pb-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
```

**DEPOIS:**
```tsx
<header className="border-b border-primary/10 pb-2 xs:pb-4 sm:pb-6 flex flex-col gap-2 xs:gap-3 sm:gap-4 sm:flex-row sm:justify-between sm:items-end">
```

---

## 5. admin/layout.tsx - Correções

### Correção 5.1: Main Content Wrapper
**ADICIONAR** após o AdminSidebar e antes de `{children}`:

```tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ... código existente ...

  return (
    <>
      <AdminSidebar />
      
      {/* Main Content Container */}
      <main className="lg:ml-20 min-h-screen">
        <div className="px-3 xs:px-4 sm:px-6 md:px-8 py-4 xs:py-6 sm:py-8 pb-24 xs:pb-28 sm:pb-28 lg:pb-8">
          {children}
        </div>
      </main>
    </>
  );
}
```

---

## 6. dropdown-menu.tsx - Correção

### Correção 8.1: Dropdown Content Constraints
**ANTES:**
```tsx
function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto ...", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}
```

**DEPOIS:**
```tsx
function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn("z-50 max-h-(--available-height) w-(--anchor-width) max-w-[calc(100vw-1rem)] min-w-32 origin-(--transform-origin) overflow-x-auto overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 ...", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}
```

---

## 🎯 Ordem de Implementação Recomendada

1. **5.1** - admin/layout.tsx (ml-20) - DEPENDE disso tudo o mais
2. **3.2** - admin/page.tsx (grid responsivo) 
3. **2.1** - EventsList.tsx (widths fixos)
4. **1.3** - AdminSidebar.tsx (mobile nav)
5. **3.1**, **3.3**, **3.5** - admin/page.tsx (spacing)
6. **2.2**, **2.3**, **2.4** - EventsList.tsx (outros)
7. **4.1**, **4.3** - admin/events/page.tsx
8. **1.1** - AdminSidebar.tsx (dropdown)
9. **8.1** - dropdown-menu.tsx
10. **Testar tudo**

---

## 🧪 Teste Após Implementar

```bash
# Em cada arquivo/componente após editar:

1. Testar em 320px → Nenhum overflow?
2. Testar em 375px → Buttons clicáveis?
3. Testar em 640px → Grid responsivo?
4. Testar em 768px → Layouts corretos?
5. Testar em 1024px → Desktop OK?

# DevTools:
- Toggle device toolbar
- Test responsive behavior
- Check for horizontal scroll
- Verify touch targets (44x44px minimum)
```
