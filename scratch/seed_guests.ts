import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim() + "-" + Math.floor(Math.random() * 1000); // Add random number to avoid conflicts
};

const nomes = [
  "Ana Silva", "Carlos Oliveira", "Beatriz Costa", "Daniel Santos", "Eduarda Lima",
  "Fernando Souza", "Gabriela Pereira", "Henrique Rodrigues", "Isabela Almeida", "João Carvalho",
  "Karina Ribeiro", "Lucas Martins", "Mariana Gomes", "Nicolas Fernandes", "Olivia Barbosa",
  "Pedro Castro", "Quintino Dias", "Rafaela Rocha", "Samuel Alves", "Tatiana Mendes",
  "Ulisses Nunes", "Vitória Monteiro", "Wagner Pinto", "Xuxa Meneghel", "Yuri Teixeira",
  "Zelia Guedes", "Aline Freitas", "Bruno Machado", "Camila Vieira", "Diego Batista",
  "Elisa Moura", "Felipe Cavalcanti", "Giovana Rezende", "Hugo Moraes", "Igor Barros",
  "Juliana Farias", "Kleber Nogueira", "Larissa Pires", "Marcelo Duarte", "Natália Borges",
  "Otávio Viana", "Patrícia Peixoto", "Renato Sales", "Sofia Pacheco", "Thiago Brito",
  "Ursula Campos", "Valdir Tavares", "Wanda Furtado", "Yago Guimarães", "Zeca Pagodinho"
];

async function main() {
  console.log("Iniciando a criação de convidados...");

  const guests = nomes.map(nome => {
    // Distribuir alguns status aleatórios (maioria CONFIRMED, alguns PENDING)
    const isConfirmed = Math.random() > 0.3;
    const isPending = !isConfirmed && Math.random() > 0.5;
    
    return {
      nome,
      slug: generateSlug(nome),
      status_confirmacao: isConfirmed ? "CONFIRMED" : isPending ? null : "DECLINED",
      tipo: "INDIVIDUAL",
      qtd_adultos: isConfirmed ? Math.floor(Math.random() * 3) + 1 : 0, // 1 a 3 adultos
      qtd_criancas: isConfirmed ? Math.floor(Math.random() * 3) : 0, // 0 a 2 crianças
      fralda_tamanho: isConfirmed ? ["RN", "P", "M", "G", "GG"][Math.floor(Math.random() * 5)] : null,
      kit_churrasco: isConfirmed ? Math.random() > 0.5 : false,
      mensagem: isConfirmed && Math.random() > 0.5 ? "Estamos muito felizes por vocês! Mal podemos esperar para conhecer o bebê." : null,
      data_resposta: isConfirmed ? new Date() : null,
    };
  });

  const result = await prisma.guest.createMany({
    data: guests,
    skipDuplicates: true,
  });

  console.log(`Foram criados ${result.count} convidados no banco de dados com sucesso!`);
}

main()
  .catch(e => {
    console.error("Erro ao criar convidados:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
