import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==========================================
// ELEMENTOS DA INTERFACE
// ==========================================

const formulario = document.getElementById("form-aluno");
const mensagem = document.getElementById("mensagem");
const botaoCadastrar = document.getElementById("btn-cadastrar");

const listaAlunos = document.getElementById("lista-alunos");
const totalAlunos = document.getElementById("total-alunos");
const pesquisa = document.getElementById("pesquisa");
const resultadoPesquisa = document.getElementById("resultado-pesquisa");

// ==========================================
// FIRESTORE
// ==========================================

const alunosCollection = collection(db, "BD3-NoSQL-Firestore");

// Armazena os alunos carregados do Firestore
let alunos = [];

// ==========================================
// FORMATAÇÃO DE DADOS
// ==========================================

function somenteNumeros(valor) {
    return valor.replace(/\D/g, "");
}

function formatarCPF(valor) {
    valor = somenteNumeros(valor).slice(0, 11);

    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    return valor;
}

function formatarRG(valor) {
    valor = somenteNumeros(valor).slice(0, 9);

    valor = valor.replace(/(\d{2})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1})$/, "$1-$2");

    return valor;
}

function formatarTelefone(valor) {
    valor = somenteNumeros(valor).slice(0, 11);

    if (valor.length <= 10) {
        valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
        valor = valor.replace(/(\d{4})(\d{1,4})$/, "$1-$2");
    } else {
        valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
        valor = valor.replace(/(\d{5})(\d{1,4})$/, "$1-$2");
    }

    return valor;
}

// ==========================================
// MÁSCARAS DOS INPUTS
// ==========================================

document.getElementById("cpf").addEventListener("input", (evento) => {
    evento.target.value = formatarCPF(evento.target.value);
});

document.getElementById("rg").addEventListener("input", (evento) => {
    evento.target.value = formatarRG(evento.target.value);
});

document.getElementById("telefone-aluno").addEventListener("input", (evento) => {
    evento.target.value = formatarTelefone(evento.target.value);
});

document.getElementById("telefone-responsavel").addEventListener("input", (evento) => {
    evento.target.value = formatarTelefone(evento.target.value);
});

// ==========================================
// MENSAGENS
// ==========================================

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
}

// ==========================================
// CADASTRAR ALUNO
// ==========================================

formulario.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    botaoCadastrar.disabled = true;
    botaoCadastrar.innerHTML = "Cadastrando...";
    mensagem.textContent = "";

    try {

        const nome = document.getElementById("nome").value.trim();

        const cpf = somenteNumeros(
            document.getElementById("cpf").value
        );

        const rg = somenteNumeros(
            document.getElementById("rg").value
        );

        const telefoneAluno = somenteNumeros(
            document.getElementById("telefone-aluno").value
        );

        const telefoneResponsavel = somenteNumeros(
            document.getElementById("telefone-responsavel").value
        );

        const email = document.getElementById("email").value.trim();

        const dataNascimento = document.getElementById("data-nascimento").value;

        // Validação do CPF
        if (cpf.length !== 11) {
            throw new Error("O CPF deve conter 11 números.");
        }

        // Validação do RG
        if (rg.length < 7 || rg.length > 9) {
            throw new Error("O RG deve conter entre 7 e 9 números.");
        }

        // Validação do telefone do aluno
        if (telefoneAluno.length < 10 || telefoneAluno.length > 11) {
            throw new Error("O telefone do aluno é inválido.");
        }

        // Validação do telefone do responsável
        if (telefoneResponsavel.length < 10 || telefoneResponsavel.length > 11) {
            throw new Error("O telefone do responsável é inválido.");
        }

        // Validação da data
        if (!dataNascimento) {
            throw new Error("Informe a data de nascimento.");
        }

        // Criando o objeto do aluno
        const aluno = {
            nome: nome,
            cpf: cpf,
            rg: rg,
            telefone_aluno: telefoneAluno,
            telefone_responsavel: telefoneResponsavel,
            email: email,

            // BÔNUS: Timestamp do Firestore
            data_nascimento: Timestamp.fromDate(
                new Date(`${dataNascimento}T12:00:00`)
            )
        };

        // Enviando o documento para o Firestore
        const documento = await addDoc(alunosCollection, aluno);

        console.log("Aluno cadastrado!");
        console.log("ID do documento:", documento.id);

        mostrarMensagem(
            "Aluno cadastrado com sucesso!",
            "sucesso"
        );

        formulario.reset();

    } catch (erro) {

        console.error("Erro ao cadastrar:", erro);

        mostrarMensagem(
            erro.message || "Erro ao cadastrar aluno.",
            "erro"
        );

    } finally {

        botaoCadastrar.disabled = false;
        botaoCadastrar.innerHTML = "<span>+</span> Cadastrar aluno";

    }

});

// ==========================================
// LISTAR ALUNOS EM TEMPO REAL
// ==========================================

onSnapshot(alunosCollection, (snapshot) => {

    alunos = [];

    snapshot.forEach((documento) => {

        alunos.push({
            id: documento.id,
            ...documento.data()
        });

    });

    // Ordena alfabeticamente
    alunos.sort((a, b) => {
        return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
    });

    totalAlunos.textContent = alunos.length;

    renderizarAlunos();

}, (erro) => {

    console.error("Erro ao carregar alunos:", erro);

    listaAlunos.innerHTML = `
        <tr>
            <td colspan="5" class="empty">
                Erro ao carregar os alunos.
                Verifique as permissões do Firestore.
            </td>
        </tr>
    `;

});

// ==========================================
// FORMATAR DATA PARA EXIBIÇÃO
// ==========================================

function formatarData(data) {

    if (!data) {
        return "Não informado";
    }

    let dataConvertida;

    // Timestamp do Firestore
    if (typeof data.toDate === "function") {
        dataConvertida = data.toDate();
    } else if (data instanceof Date) {
        dataConvertida = data;
    } else {
        return "Data inválida";
    }

    return dataConvertida.toLocaleDateString("pt-BR");
}

// ==========================================
// RENDERIZAR LISTAGEM
// ==========================================

function renderizarAlunos() {

    const termo = pesquisa.value.trim().toLowerCase();

    const alunosFiltrados = alunos.filter((aluno) => {

        return (aluno.nome || "").toLowerCase().includes(termo);

    });

    resultadoPesquisa.textContent =
        `${alunosFiltrados.length} registro(s) encontrado(s)`;

    if (alunosFiltrados.length === 0) {

        listaAlunos.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Nenhum aluno encontrado.
                </td>
            </tr>
        `;

        return;
    }

    listaAlunos.innerHTML = "";

    alunosFiltrados.forEach((aluno) => {

        const linha = document.createElement("tr");

        const colunaNome = document.createElement("td");
        colunaNome.className = "aluno-nome";
        colunaNome.textContent = aluno.nome || "Sem nome";

        const colunaCPF = document.createElement("td");
        colunaCPF.textContent = formatarCPF(aluno.cpf || "");

        const colunaEmail = document.createElement("td");
        colunaEmail.className = "aluno-email";
        colunaEmail.textContent = aluno.email || "Não informado";

        const colunaNascimento = document.createElement("td");
        colunaNascimento.textContent = formatarData(aluno.data_nascimento);

        const colunaAcao = document.createElement("td");

        const botaoExcluir = document.createElement("button");
        botaoExcluir.className = "btn-excluir";
        botaoExcluir.textContent = "×";
        botaoExcluir.title = "Excluir aluno";

        botaoExcluir.addEventListener("click", () => {
            excluirAluno(aluno.id, aluno.nome);
        });

        colunaAcao.appendChild(botaoExcluir);

        linha.appendChild(colunaNome);
        linha.appendChild(colunaCPF);
        linha.appendChild(colunaEmail);
        linha.appendChild(colunaNascimento);
        linha.appendChild(colunaAcao);

        listaAlunos.appendChild(linha);

    });

}

// ==========================================
// PESQUISAR ALUNOS
// ==========================================

pesquisa.addEventListener("input", () => {
    renderizarAlunos();
});

// ==========================================
// EXCLUIR ALUNO
// ==========================================

async function excluirAluno(id, nome) {

    const confirmacao = confirm(
        `Deseja realmente excluir o aluno "${nome}"?`
    );

    if (!confirmacao) {
        return;
    }

    try {

        const referenciaDocumento = doc(
            db,
            "BD3-NoSQL-Firestore",
            id
        );

        await deleteDoc(referenciaDocumento);

        console.log("Aluno excluído:", nome);

    } catch (erro) {

        console.error("Erro ao excluir aluno:", erro);

        alert("Não foi possível excluir o aluno.");

    }

}