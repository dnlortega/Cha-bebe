# Correções Dark Mode - Admin Panel

## 1. [src/app/admin/guests/page.tsx]

### Correção 1.1: Input de Busca (linha ~127)
```diff
- ANTES:
  <Input placeholder="Buscar..." className="pl-9 bg-white border-primary/10 rounded-none h-10 text-[10px] tracking-widest uppercase" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

+ DEPOIS:
  <Input placeholder="Buscar..." className="pl-9 bg-white dark:bg-stone-900 border-primary/10 dark:border-primary/30 rounded-none h-10 text-[10px] tracking-widest uppercase dark:text-stone-200" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
```

### Correção 1.2: SelectTrigger Filtro de Status (linha ~131)
```diff
- ANTES:
  <SelectTrigger className="rounded-none border-primary/10 h-10 bg-white text-[10px] tracking-widest w-32"><SelectValue /></SelectTrigger>

+ DEPOIS:
  <SelectTrigger className="rounded-none border-primary/10 dark:border-primary/30 h-10 bg-white dark:bg-stone-900 text-[10px] tracking-widest w-32 dark:text-stone-200"><SelectValue /></SelectTrigger>
```

### Correção 1.3: Botões de Ação (Export, Refresh) (linha ~137-138)
```diff
- ANTES:
  <Button variant="outline" size="icon" onClick={exportCSV} className="h-10 w-10 rounded-none border-primary/10 bg-white"><Download className="h-4 w-4 text-primary" /></Button>
  <Button variant="outline" size="icon" onClick={fetchGuests} disabled={loading} className="h-10 w-10 rounded-none border-primary/10 bg-white"><RefreshCw className={loading ? "animate-spin h-4 w-4" : "h-4 w-4"} /></Button>

+ DEPOIS:
  <Button variant="outline" size="icon" onClick={exportCSV} className="h-10 w-10 rounded-none border-primary/10 dark:border-primary/30 bg-white dark:bg-stone-900"><Download className="h-4 w-4 text-primary dark:text-primary" /></Button>
  <Button variant="outline" size="icon" onClick={fetchGuests} disabled={loading} className="h-10 w-10 rounded-none border-primary/10 dark:border-primary/30 bg-white dark:bg-stone-900"><RefreshCw className={loading ? "animate-spin h-4 w-4" : "h-4 w-4"} /></Button>
```

### Correção 1.4: Botão Delete All (linha ~142)
```diff
- ANTES:
  <Button 
    variant="outline" 
    size="icon" 
    onClick={handleDeleteAll} 
    disabled={loading || guests.length === 0} 
    className="h-10 w-10 rounded-none border-red-200 hover:bg-red-50 hover:border-red-300 bg-white text-red-500"
  >
    <Trash2 className="h-4 w-4" />
  </Button>

+ DEPOIS:
  <Button 
    variant="outline" 
    size="icon" 
    onClick={handleDeleteAll} 
    disabled={loading || guests.length === 0} 
    className="h-10 w-10 rounded-none border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-800 bg-white dark:bg-stone-900 text-red-500 dark:text-red-400"
  >
    <Trash2 className="h-4 w-4" />
  </Button>
```

### Correção 1.5: Table Container (linha ~155)
```diff
- ANTES:
  <div className="bg-white border border-primary/5 shadow-xl overflow-hidden rounded-none hidden md:block">

+ DEPOIS:
  <div className="bg-white dark:bg-stone-950 border border-primary/5 dark:border-primary/20 shadow-xl overflow-hidden rounded-none hidden md:block">
```

### Correção 1.6: TableHeader (linha ~157)
```diff
- ANTES:
  <TableHeader className="bg-stone-50/80">

+ DEPOIS:
  <TableHeader className="bg-stone-50/80 dark:bg-stone-900/50">
```

### Correção 1.7: TableRow Hover (linha ~169)
```diff
- ANTES:
  <TableRow key={guest.id} className="hover:bg-stone-50/40 border-primary/5 group">

+ DEPOIS:
  <TableRow key={guest.id} className="hover:bg-stone-50/40 dark:hover:bg-stone-900/40 border-primary/5 dark:border-primary/20 group">
```

### Correção 1.8: Mobile Card (linha ~243)
```diff
- ANTES:
  <div key={guest.id} className="bg-white border border-primary/5 p-5 shadow-lg space-y-4 rounded-none">

+ DEPOIS:
  <div key={guest.id} className="bg-white dark:bg-stone-950 border border-primary/5 dark:border-primary/20 p-5 shadow-lg space-y-4 rounded-none">
```

### Correção 1.9: Empty State (linha ~243)
```diff
- ANTES:
  <div className="text-center py-10 bg-white border border-primary/5">

+ DEPOIS:
  <div className="text-center py-10 bg-white dark:bg-stone-950 border border-primary/5 dark:border-primary/20">
```

### Correção 1.10: Dialog Input (linha ~256)
```diff
- ANTES:
  <Input value={editName} onChange={e => setEditName(e.target.value)} className="rounded-none h-12 bg-stone-50 text-[11px] tracking-widest uppercase" placeholder="NOME" />

+ DEPOIS:
  <Input value={editName} onChange={e => setEditName(e.target.value)} className="rounded-none h-12 bg-stone-50 dark:bg-stone-900 text-[11px] tracking-widest uppercase dark:text-stone-200" placeholder="NOME" />
```

### Correção 1.11: Dialog Textarea (linha ~264)
```diff
- ANTES:
  {editType === "FAMILIA" && <Textarea value={editMembers} onChange={e => setEditMembers(e.target.value)} placeholder="MEMBROS (VÍRGULA)" className="h-24 rounded-none bg-stone-50" />}

+ DEPOIS:
  {editType === "FAMILIA" && <Textarea value={editMembers} onChange={e => setEditMembers(e.target.value)} placeholder="MEMBROS (VÍRGULA)" className="h-24 rounded-none bg-stone-50 dark:bg-stone-900 dark:text-stone-200" />}
```

---

## 2. [src/app/admin/add/page.tsx]

### Correção 2.1: Card Container (linha ~47)
```diff
- ANTES:
  <Card className="border-none shadow-2xl bg-white rounded-none overflow-hidden">

+ DEPOIS:
  <Card className="border-none shadow-2xl bg-white dark:bg-stone-950 rounded-none overflow-hidden">
```

### Correção 2.2: Card Header (linha ~49)
```diff
- ANTES:
  <div className="bg-stone-900 p-10 text-white flex justify-between items-center border-b-4 border-primary">

+ DEPOIS:
  <div className="bg-stone-900 dark:bg-stone-800 p-10 text-white flex justify-between items-center border-b-4 border-primary dark:border-primary">
```

### Correção 2.3: Textarea (linha ~63)
```diff
- ANTES:
  <Textarea 
    placeholder="EXEMPLO:&#10;DANIEL LOPES | INDIVIDUAL | | RN | SIM&#10;FAMILIA SILVA | FAMILIA | JOÃO, MARIA | P | NÃO" 
    className="min-h-[450px] bg-stone-50/50 border-none rounded-none focus-visible:ring-0 text-[12px] tracking-widest p-10 leading-relaxed resize-none placeholder:opacity-20"
    value={newGuestsText}
    onChange={(e) => setNewGuestsText(e.target.value)}
  />

+ DEPOIS:
  <Textarea 
    placeholder="EXEMPLO:&#10;DANIEL LOPES | INDIVIDUAL | | RN | SIM&#10;FAMILIA SILVA | FAMILIA | JOÃO, MARIA | P | NÃO" 
    className="min-h-[450px] bg-stone-50/50 dark:bg-stone-900/50 border-none rounded-none focus-visible:ring-0 text-[12px] tracking-widest p-10 leading-relaxed resize-none placeholder:opacity-20 dark:text-stone-200 dark:placeholder:opacity-30"
    value={newGuestsText}
    onChange={(e) => setNewGuestsText(e.target.value)}
  />
```

### Correção 2.4: Info Box (linha ~73)
```diff
- ANTES:
  <div className="space-y-6 bg-white p-10 border border-primary/5 shadow-lg">

+ DEPOIS:
  <div className="space-y-6 bg-white dark:bg-stone-950 p-10 border border-primary/5 dark:border-primary/20 shadow-lg">
```

### Correção 2.5: Code Blocks (linha ~89, ~96, ~104)
```diff
- ANTES (all code blocks):
  <code className="text-[9px] block bg-stone-50 p-3 border border-primary/5 tracking-widest text-primary/70">

+ DEPOIS:
  <code className="text-[9px] block bg-stone-50 dark:bg-stone-900/50 p-3 border border-primary/5 dark:border-primary/20 tracking-widest text-primary/70 dark:text-primary/50">
```

### Correção 2.6: Dica Box (linha ~113)
```diff
- ANTES:
  <div className="bg-primary/5 p-8 border border-primary/10">

+ DEPOIS:
  <div className="bg-primary/5 dark:bg-primary/10 p-8 border border-primary/10 dark:border-primary/20">
```

---

## 3. [src/app/admin/events/page.tsx]

### Correção 3.1: Onboarding Card (linha ~81)
```diff
- ANTES:
  <Card className="border border-primary/15 bg-stone-50/30">

+ DEPOIS:
  <Card className="border border-primary/15 dark:border-primary/25 bg-stone-50/30 dark:bg-stone-900/30">
```

### Correção 3.2: Card Content (linha ~82-84)
```diff
- ANTES:
  <CardContent className="p-6 space-y-4">
    <p className="text-xs text-stone-600 leading-relaxed">

+ DEPOIS:
  <CardContent className="p-6 space-y-4">
    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
```

### Correção 3.3: Input Fields (linha ~90, ~98, ~105)
```diff
- ANTES:
  <Input
    value={eventName}
    onChange={(event) => setEventName(event.target.value)}
    placeholder="Chá de Bebê da Maria"
    className="w-full"
  />

+ DEPOIS:
  <Input
    value={eventName}
    onChange={(event) => setEventName(event.target.value)}
    placeholder="Chá de Bebê da Maria"
    className="w-full dark:bg-stone-900 dark:text-stone-200 dark:border-stone-700"
  />
```

### Correção 3.4: Label (linha ~86, ~93, ~101, ~109)
```diff
- ANTES:
  <Label className="mb-1 block text-[10px] uppercase tracking-[0.32em] text-stone-500">

+ DEPOIS:
  <Label className="mb-1 block text-[10px] uppercase tracking-[0.32em] text-stone-500 dark:text-stone-400">
```

### Correção 3.5: Create Form Card (linha ~152)
```diff
- ANTES:
  <Card className="border border-primary/20 shadow-sm animate-in fade-in duration-300">

+ DEPOIS:
  <Card className="border border-primary/20 dark:border-primary/30 shadow-sm animate-in fade-in duration-300 dark:bg-stone-950">
```

### Correção 3.6: Checkbox Label (linha ~116, ~125)
```diff
- ANTES:
  <span className="text-[10px] uppercase tracking-[0.32em] text-stone-500">

+ DEPOIS:
  <span className="text-[10px] uppercase tracking-[0.32em] text-stone-500 dark:text-stone-400">
```

---

## 4. [src/app/admin/page.tsx]

### Correção 4.1: Refresh Button (linha ~259)
```diff
- ANTES:
  className="border border-primary/20 bg-white/50 backdrop-blur-sm hover:bg-primary hover:text-white transition-all shadow-sm rounded-xl h-11 px-6 group"

+ DEPOIS:
  className="border border-primary/20 dark:border-primary/30 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm hover:bg-primary dark:hover:bg-primary hover:text-white transition-all shadow-sm rounded-xl h-11 px-6 group"
```

### Correção 4.2: RefreshCw Icon (linha ~261)
```diff
- ANTES:
  <RefreshCw className={cn("h-4 w-4 mr-2 text-primary group-hover:text-white transition-colors", loading && "animate-spin")} />

+ DEPOIS:
  <RefreshCw className={cn("h-4 w-4 mr-2 text-primary dark:text-primary group-hover:text-white transition-colors", loading && "animate-spin")} />
```

### Correção 4.3: Status Card (já está bom, mas confirmar)
```
Linha ~277: Card já tem dark: prefix correto
className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white rounded-[2rem]"
```

---

## 5. [src/app/admin/access/page.tsx]

### Correção 5.1: Permission Button (Unselected) (linha ~147)
```diff
- ANTES:
  "border-stone-100 bg-stone-50/50 hover:border-stone-200"

+ DEPOIS:
  "border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 hover:border-stone-200 dark:hover:border-stone-700"
```

### Correção 5.2: Permission Button (Selected) (linha ~144)
```diff
- ANTES:
  "border-primary/30 bg-primary/5"

+ DEPOIS:
  "border-primary/30 dark:border-primary/40 bg-primary/5 dark:bg-primary/10"
```

### Correção 5.3: Checkbox Icon Colors (linha ~149-152)
```diff
- ANTES:
  <CheckSquare className="h-3.5 w-3.5 text-primary flex-shrink-0" />
  ...
  <Square className="h-3.5 w-3.5 text-stone-300 flex-shrink-0 group-hover:text-stone-400" />

+ DEPOIS:
  <CheckSquare className="h-3.5 w-3.5 text-primary dark:text-primary flex-shrink-0" />
  ...
  <Square className="h-3.5 w-3.5 text-stone-300 dark:text-stone-700 flex-shrink-0 group-hover:text-stone-400 dark:group-hover:text-stone-600" />
```

### Correção 5.4: Permission Text (linha ~155, ~158)
```diff
- ANTES:
  <p className="text-[9px] font-black tracking-wider uppercase truncate ${isSelected ? "text-primary" : "text-stone-500"}">
  <p className="text-[7.5px] text-stone-400 truncate">{screen.desc}</p>

+ DEPOIS:
  <p className="text-[9px] font-black tracking-wider uppercase truncate ${isSelected ? "text-primary dark:text-primary" : "text-stone-500 dark:text-stone-400"}">
  <p className="text-[7.5px] text-stone-400 dark:text-stone-500 truncate">{screen.desc}</p>
```

### Correção 5.5: Save Button (Selected) (linha ~186)
```diff
- ANTES:
  ? "bg-stone-900 text-white hover:bg-stone-800"
  : "bg-stone-100 text-stone-400 cursor-not-allowed"

+ DEPOIS:
  ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100"
  : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed"
```

### Correção 5.6: Card Container (linha ~398)
```diff
- ANTES:
  <Card className="w-full max-w-md border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-white rounded-none overflow-hidden animate-in fade-in duration-700">

+ DEPOIS:
  <Card className="w-full max-w-md border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-white dark:bg-stone-950 rounded-none overflow-hidden animate-in fade-in duration-700">
```

### Correção 5.7: Loader (linha ~192-201)
```diff
- ANTES (before getStatusBadge):
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

+ DEPOIS:
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center dark:bg-stone-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary opacity-20" />
      </div>
    );
  }
```

---

## Resumo das Mudanças

- ✅ Input fields: Adicionar `dark:bg-stone-900 dark:text-stone-200 dark:border-stone-700`
- ✅ Select triggers: Adicionar `dark:bg-stone-900 dark:text-stone-200 dark:border-primary/30`
- ✅ Buttons (outline): Adicionar `dark:bg-stone-900 dark:border-primary/30`
- ✅ Table/Cards (bg-white): Adicionar `dark:bg-stone-950`
- ✅ Table backgrounds (bg-stone-50): Adicionar `dark:bg-stone-900/50`
- ✅ Borders (border-primary/5): Adicionar `dark:border-primary/20`
- ✅ Red buttons: Adicionar `dark:border-red-900 dark:hover:bg-red-950 dark:text-red-400`
- ✅ Save/Admin buttons: Adicionar `dark:bg-white dark:text-stone-900`
- ✅ Text colors: Adicionar `dark:text-stone-200` ou `dark:text-stone-400` conforme contexto

