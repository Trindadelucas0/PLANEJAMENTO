// Dados de exemplo (serão substituídos pelos dados reais da planilha)
const financialData = {
    income: 5000,
    expenses: 3000,
    savings: 2000
};

const goals = [
    { name: "Comprar um carro", target: 50000, current: 20000 },
    { name: "Viagem para Europa", target: 20000, current: 5000 },
    { name: "Reserva de emergência", target: 10000, current: 8000 }
];

const expenses = [
    { category: "Moradia", amount: 1500 },
    { category: "Alimentação", amount: 800 },
    { category: "Transporte", amount: 400 },
    { category: "Lazer", amount: 300 }
];

// Array para armazenar as transações
let transactions = [];

// Meses do ano
const MESES = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'
];

// ID do orçamento atual
let orcamentoAtualId = 'orcamento_2024';

// Função para gerar um novo ID
function gerarNovoId() {
    return 'orcamento_' + new Date().getTime();
}

// Função para formatar valores monetários
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para formatar datas
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para atualizar o resumo financeiro
function updateFinancialSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('balance').textContent = formatCurrency(balance);
}

// Função para atualizar as metas
function updateGoals() {
    const goalsDiv = document.getElementById('goals');
    goalsDiv.innerHTML = goals.map(goal => `
        <div class="goal-item">
            <h3>${goal.name}</h3>
            <div class="progress-bar">
                <div class="progress" style="width: ${(goal.current / goal.target) * 100}%"></div>
            </div>
            <p>R$ ${goal.current.toFixed(2)} / R$ ${goal.target.toFixed(2)}</p>
        </div>
    `).join('');
}

// Função para atualizar os gastos
function updateExpenses() {
    const expensesDiv = document.getElementById('expenses');
    expensesDiv.innerHTML = expenses.map(expense => `
        <div class="expense-item">
            <h3>${expense.category}</h3>
            <p>R$ ${expense.amount.toFixed(2)}</p>
        </div>
    `).join('');
}

// Função para adicionar uma nova transação
function addTransaction(transaction) {
    transactions.push(transaction);
    updateFinancialSummary();
    updateTransactionsList();
    saveTransactions();
}

// Função para atualizar a lista de transações
function updateTransactionsList() {
    const transactionsList = document.getElementById('transactions-list');
    transactionsList.innerHTML = '';

    // Ordenar transações por data (mais recentes primeiro)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        
        transactionElement.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-date">${formatDate(transaction.date)}</div>
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-category">${transaction.category}</div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${formatCurrency(transaction.amount)}
            </div>
        `;

        transactionsList.appendChild(transactionElement);
    });
}

// Função para salvar transações no localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Função para carregar transações do localStorage
function loadTransactions() {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
        updateFinancialSummary();
        updateTransactionsList();
    }
}

function formatarValor(valor) {
    return isNaN(valor) ? 'R$ 0,00' : valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function criarLinhaTabela(tipo, categoria = '', valores = {}) {
    const tr = document.createElement('tr');
    // Categoria
    const tdCategoria = document.createElement('td');
    tdCategoria.contentEditable = true;
    tdCategoria.innerText = categoria;
    tr.appendChild(tdCategoria);
    // Meses
    MESES.forEach(mes => {
        const td = document.createElement('td');
        td.contentEditable = true;
        td.innerText = valores[mes] !== undefined ? valores[mes] : '';
        td.addEventListener('input', () => {
            atualizarTotaisTabela(tipo);
            atualizarResumoFinanceiro();
        });
        tr.appendChild(td);
    });
    // Total da linha
    const tdTotal = document.createElement('td');
    tdTotal.className = 'linha-total';
    tdTotal.innerText = 'R$ 0,00';
    tr.appendChild(tdTotal);
    // Botão remover
    const tdRemover = document.createElement('td');
    const btnRemover = document.createElement('button');
    btnRemover.innerText = 'Remover';
    btnRemover.onclick = () => {
        tr.remove();
        atualizarTotaisTabela(tipo);
        atualizarResumoFinanceiro();
        salvarTabela(tipo);
    };
    tdRemover.appendChild(btnRemover);
    tr.appendChild(tdRemover);
    // Atualiza totais ao editar categoria
    tdCategoria.addEventListener('input', () => salvarTabela(tipo));
    return tr;
}

function addEntradaRow() {
    const tbody = document.getElementById('entradas-body');
    tbody.appendChild(criarLinhaTabela('entradas'));
    atualizarTotaisTabela('entradas');
    atualizarResumoFinanceiro();
    salvarTabela('entradas');
}
function addGastoRow() {
    const tbody = document.getElementById('gastos-body');
    tbody.appendChild(criarLinhaTabela('gastos'));
    atualizarTotaisTabela('gastos');
    atualizarResumoFinanceiro();
    salvarTabela('gastos');
}
function addFixaRow() {
    const tbody = document.getElementById('fixas-body');
    tbody.appendChild(criarLinhaTabela('fixas'));
    atualizarTotaisTabela('fixas');
    salvarTabela('fixas');
}

let graficoMensal = null;
function atualizarGraficoMensal() {
    const ctx = document.getElementById('grafico-mensal').getContext('2d');
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    let entradas = [], gastos = [];
    for (let i = 0; i < 12; i++) {
        // Entradas
        let somaEntradas = 0;
        document.querySelectorAll('#entradas-body tr').forEach(tr => {
            let valor = parseFloat(tr.children[i+1].innerText.replace(',', '.').replace('R$', '').replace(/\s/g, ''));
            somaEntradas += isNaN(valor) ? 0 : valor;
        });
        // Gastos + Fixas
        let somaGastos = 0;
        document.querySelectorAll('#gastos-body tr').forEach(tr => {
            let valor = parseFloat(tr.children[i+1].innerText.replace(',', '.').replace('R$', '').replace(/\s/g, ''));
            somaGastos += isNaN(valor) ? 0 : valor;
        });
        document.querySelectorAll('#fixas-body tr').forEach(tr => {
            let valor = parseFloat(tr.children[i+1].innerText.replace(',', '.').replace('R$', '').replace(/\s/g, ''));
            somaGastos += isNaN(valor) ? 0 : valor;
        });
        entradas.push(somaEntradas);
        gastos.push(somaGastos);
    }
    if (graficoMensal) graficoMensal.destroy();
    graficoMensal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: mesesNomes,
            datasets: [
                {
                    label: 'Entradas',
                    data: entradas,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: 'rgba(39, 174, 96, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Gastos (inclui fixas)',
                    data: gastos,
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(192, 57, 43, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

// Chamar atualizarGraficoMensal sempre que atualizar tabelas
function atualizarTotaisTabela(tipo) {
    const tbody = document.getElementById(tipo + '-body');
    const linhas = Array.from(tbody.querySelectorAll('tr'));
    let totaisMes = Array(12).fill(0);
    let totalGeral = 0;
    linhas.forEach(tr => {
        let somaLinha = 0;
        for (let i = 0; i < 12; i++) {
            const td = tr.children[i+1];
            let valor = parseFloat(td.innerText.replace(',', '.').replace('R$', '').replace(/\s/g, ''));
            valor = isNaN(valor) ? 0 : valor;
            somaLinha += valor;
            totaisMes[i] += valor;
        }
        tr.querySelector('.linha-total').innerText = formatarValor(somaLinha);
        totalGeral += somaLinha;
    });
    // Atualiza totais no tfoot
    MESES.forEach((mes, i) => {
        const th = document.getElementById(`${tipo}-total-${mes}`);
        if (th) th.innerText = formatarValor(totaisMes[i]);
    });
    const thGeral = document.getElementById(`${tipo}-total-geral`);
    if (thGeral) thGeral.innerText = formatarValor(totalGeral);
    salvarTabela(tipo);
    atualizarResumoMensal();
    atualizarGraficoMensal();
}

function salvarTabela(tipo) {
    const tbody = document.getElementById(tipo + '-body');
    const linhas = Array.from(tbody.querySelectorAll('tr'));
    const dados = linhas.map(tr => {
        const categoria = tr.children[0].innerText;
        const valores = {};
        for (let i = 0; i < 12; i++) {
            valores[MESES[i]] = tr.children[i+1].innerText;
        }
        return { categoria, valores };
    });
    localStorage.setItem('tabela_' + tipo, JSON.stringify(dados));
}

function carregarTabela(tipo) {
    const tbody = document.getElementById(tipo + '-body');
    tbody.innerHTML = '';
    const dados = JSON.parse(localStorage.getItem('tabela_' + tipo) || '[]');
    dados.forEach(linha => {
        tbody.appendChild(criarLinhaTabela(tipo, linha.categoria, linha.valores));
    });
    atualizarTotaisTabela(tipo);
}

function atualizarResumoFinanceiro() {
    // Entradas
    let totalEntradas = 0;
    let totalGastos = 0;
    // Soma entradas
    const entradas = document.getElementById('entradas-body').querySelectorAll('tr');
    entradas.forEach(tr => {
        const total = tr.querySelector('.linha-total');
        if (total) totalEntradas += parseFloat(total.innerText.replace('R$', '').replace('.', '').replace(',', '.')) || 0;
    });
    // Soma gastos
    const gastos = document.getElementById('gastos-body').querySelectorAll('tr');
    gastos.forEach(tr => {
        const total = tr.querySelector('.linha-total');
        if (total) totalGastos += parseFloat(total.innerText.replace('R$', '').replace('.', '').replace(',', '.')) || 0;
    });
    document.getElementById('total-entradas').innerText = formatarValor(totalEntradas);
    document.getElementById('total-gastos').innerText = formatarValor(totalGastos);
    document.getElementById('saldo').innerText = formatarValor(totalEntradas - totalGastos);
}

function atualizarResumoMensal() {
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const resumoBody = document.getElementById('resumo-mensal-body');
    resumoBody.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        // Entradas
        let entradas = 0;
        document.querySelectorAll('#entradas-body tr').forEach(tr => {
            let valor = parseFloat(tr.children[i+1].innerText.replace(',', '.').replace('R$', '').replace(/\s/g, ''));
            entradas += isNaN(valor) ? 0 : valor;
        });
        // Gastos
        let gastos = 0;
        document.querySelectorAll('#gastos-body tr').forEach(tr => {
            let valor = parseFloat(tr.children[i+1].innerText.replace(',', '.').replace('R$', '').replace(/\s/g, ''));
            gastos += isNaN(valor) ? 0 : valor;
        });
        // Fixas
        let fixas = 0;
        document.querySelectorAll('#fixas-body tr').forEach(tr => {
            let valor = parseFloat(tr.children[i+1].innerText.replace(',', '.').replace('R$', '').replace(/\s/g, ''));
            fixas += isNaN(valor) ? 0 : valor;
        });
        // Saldo do mês
        let saldo = entradas - gastos - fixas;
        // Monta linha
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${mesesNomes[i]}</td>
            <td>${formatarValor(entradas)}</td>
            <td>${formatarValor(gastos)}</td>
            <td>${formatarValor(fixas)}</td>
            <td style="font-weight:bold; color:${saldo >= 0 ? '#16a085' : '#e74c3c'}">${formatarValor(saldo)}</td>
        `;
        resumoBody.appendChild(tr);
    }
}

// Função para salvar todos os dados no localStorage
function salvarTodosDados() {
    try {
        // Criar objeto com todos os dados
        const dados = {
            entradas: [],
            gastos: [],
            fixas: [],
            transacoes: transactions,
            ultimaAtualizacao: new Date().toISOString()
        };

        // Coletar dados das tabelas
        document.querySelectorAll('#entradas-body tr').forEach(tr => {
            const categoria = tr.children[0].innerText;
            const valores = {};
            for (let i = 0; i < 12; i++) {
                valores[MESES[i]] = tr.children[i+1].innerText;
            }
            dados.entradas.push({ categoria, valores });
        });

        document.querySelectorAll('#gastos-body tr').forEach(tr => {
            const categoria = tr.children[0].innerText;
            const valores = {};
            for (let i = 0; i < 12; i++) {
                valores[MESES[i]] = tr.children[i+1].innerText;
            }
            dados.gastos.push({ categoria, valores });
        });

        document.querySelectorAll('#fixas-body tr').forEach(tr => {
            const categoria = tr.children[0].innerText;
            const valores = {};
            for (let i = 0; i < 12; i++) {
                valores[MESES[i]] = tr.children[i+1].innerText;
            }
            dados.fixas.push({ categoria, valores });
        });

        // Salvar dados no localStorage
        localStorage.setItem(orcamentoAtualId, JSON.stringify(dados));
        
        // Atualizar lista de orçamentos
        atualizarListaOrcamentos();
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

// Função para carregar todos os dados do localStorage
function carregarTodosDados() {
    try {
        // Limpar tabelas antes de carregar
        document.getElementById('entradas-body').innerHTML = '';
        document.getElementById('gastos-body').innerHTML = '';
        document.getElementById('fixas-body').innerHTML = '';

        // Carregar dados do localStorage
        const dadosSalvos = localStorage.getItem(orcamentoAtualId);
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            
            // Carregar entradas
            dados.entradas.forEach(linha => {
                const tr = criarLinhaTabela('entradas', linha.categoria, linha.valores);
                document.getElementById('entradas-body').appendChild(tr);
            });

            // Carregar gastos
            dados.gastos.forEach(linha => {
                const tr = criarLinhaTabela('gastos', linha.categoria, linha.valores);
                document.getElementById('gastos-body').appendChild(tr);
            });

            // Carregar fixas
            dados.fixas.forEach(linha => {
                const tr = criarLinhaTabela('fixas', linha.categoria, linha.valores);
                document.getElementById('fixas-body').appendChild(tr);
            });

            // Carregar transações
            transactions = dados.transacoes || [];
        }

        // Atualizar totais e visualizações
        atualizarTotaisTabela('entradas');
        atualizarTotaisTabela('gastos');
        atualizarTotaisTabela('fixas');
        atualizarResumoFinanceiro();
        atualizarResumoMensal();
        atualizarGraficoMensal();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Função para atualizar a lista de orçamentos
function atualizarListaOrcamentos() {
    const listaOrcamentos = document.getElementById('lista-orcamentos');
    if (!listaOrcamentos) return;

    listaOrcamentos.innerHTML = '';
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orcamento_')) {
            const dados = JSON.parse(localStorage.getItem(key));
            const li = document.createElement('li');
            li.innerHTML = `
                <span>Orçamento ${key.replace('orcamento_', '')}</span>
                <span>Última atualização: ${new Date(dados.ultimaAtualizacao).toLocaleString()}</span>
                <button onclick="carregarOrcamento('${key}')">Carregar</button>
                <button onclick="excluirOrcamento('${key}')">Excluir</button>
            `;
            listaOrcamentos.appendChild(li);
        }
    }
}

// Função para carregar um orçamento específico
function carregarOrcamento(id) {
    orcamentoAtualId = id;
    carregarTodosDados();
}

// Função para excluir um orçamento
function excluirOrcamento(id) {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
        localStorage.removeItem(id);
        if (id === orcamentoAtualId) {
            orcamentoAtualId = gerarNovoId();
            carregarTodosDados();
        }
        atualizarListaOrcamentos();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já existe um orçamento
    const orcamentos = Object.keys(localStorage).filter(key => key.startsWith('orcamento_'));
    if (orcamentos.length === 0) {
        orcamentoAtualId = gerarNovoId();
    } else {
        orcamentoAtualId = orcamentos[0]; // Usar o primeiro orçamento encontrado
    }

    // Carregar todos os dados ao iniciar
    setTimeout(() => {
        carregarTodosDados();
        atualizarListaOrcamentos();
    }, 100);

    // Adicionar evento para salvar dados quando houver mudanças
    document.addEventListener('input', () => {
        setTimeout(() => {
            salvarTodosDados();
        }, 100);
    });

    // Adicionar evento para salvar dados quando adicionar/remover linhas
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && 
            (e.target.textContent === 'Adicionar Categoria' || 
             e.target.textContent === 'Remover')) {
            setTimeout(() => {
                salvarTodosDados();
            }, 100);
        }
    });

    const form = document.getElementById('entry-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const transaction = {
            date: document.getElementById('date').value,
            type: document.getElementById('type').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            amount: parseFloat(document.getElementById('amount').value)
        };

        addTransaction(transaction);
        form.reset();
    });
}); 