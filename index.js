let editMode = false;
let tarefaId = null;

function abrirModal() {
    overlay.classList.add("active");
    criarTarefa.classList.add("active");


    form.reset();
    editMode = false;
}

function editarModal(id) {
    overlay.classList.add("active");
    criarTarefa.classList.add("active");

    editMode = true;
    tarefaId = id;

    fetch(`http://localhost:3000/tarefas/${id}`)
        .then(response => response.json())
        .then(tarefa => {
            titulo.value = tarefa.titulo;
            descricao.value = tarefa.descricao;
            prioridade.value = tarefa.prioridade;
            prazo.value = tarefa.prazo;
        });
}

function fecharModal() {
    overlay.classList.remove("active");
    criarTarefa.classList.remove("active");
    form.reset(); // Reseta o formulário ao fechar
}

function buscarTarefa() {
    fetch("http://localhost:3000/tarefas")
        .then(response => response.json())
        .then(data => {
            ajustarPrioridades(data);
            tarefasOrdenadas = ordenarTarefas(data);  // Ordena antes de inserir
            inserirTarefa(tarefasOrdenadas);
        })
}
buscarTarefa();

function inserirTarefa(listaTarefas) {

    if (listaTarefas.length > 0) {
        lista.innerHTML = "";
        listaTarefas.map(tarefa => {
            lista.innerHTML += `
                <li>
                    <h5>${tarefa.titulo}</h5>
                    <p>${tarefa.descricao}</p>
                    <p>Prioridade: ${tarefa.prioridade}</p>
                    <p>Prazo: ${tarefa.prazo}</p>
                    <div class="actions">
                        <box-icon name='edit' onclick="editarModal(${tarefa.id})"></box-icon>
                        <box-icon name='trash-alt' size="sm" onclick="deletarTarefa(${tarefa.id})"></box-icon>
                    </div>
                </li>
            `;
        });
    }
}


function novaTarefa() {
    event.preventDefault();
    let tarefa = {
        titulo: titulo.value,
        descricao: descricao.value,
        prioridade: prioridade.value,
        prazo: prazo.value
    }

    // Verifica se está em modo de criação ou edição
    if (editMode && tarefaId) {
        // Editando tarefa existente
        fetch(`http://localhost:3000/tarefas/${tarefaId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(tarefa)
        })
            .then(response => response.json())
            .then(response => {
                fecharModal();
                buscarTarefa();
                form.reset();
            });
    }
    else {
        fetch("http://localhost:3000/tarefas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(tarefa)
        })
            .then(response => response.json())
            .then(response => {
                fecharModal();
                buscarTarefa();
                let form = document.querySelector('#criarTarefa form');
                form.reset();
            });

    }

}
function ordenarTarefas(listaTarefas) {
    // Mapeamento das prioridades
    const prioridadeMap = {
        'alta': 1,
        'media': 2,
        'baixa': 3
    };

    return listaTarefas.sort((a, b) => {
        // Comparar prioridades
        const prioridadeA = prioridadeMap[a.prioridade] || Infinity; 
        const prioridadeB = prioridadeMap[b.prioridade] || Infinity;

        // Primeiro, verifica a prioridade
        if (prioridadeA !== prioridadeB) {
            return prioridadeA - prioridadeB; // Ordem por prioridade
        }

        // Se as prioridades forem iguais, ordena pelo prazo
        const prazoA = new Date(a.prazo);
        const prazoB = new Date(b.prazo);
        return prazoA - prazoB; // Ordem por prazo
    });
}



function ajustarPrioridades(tarefas) {
    const hoje = new Date();
    tarefas.forEach(tarefa => {
        const dataPrazo = new Date(tarefa.prazo);
        const diferencaDias = (dataPrazo - hoje) / (1000 * 60 * 60 * 24);
        // Se o prazo estiver a menos de 1 dia, muda a prioridade para alta
        if (diferencaDias <= 1) {
            tarefa.prioridade = 'alta';  // Muda a prioridade para alta
        }
    });
}


function deletarTarefa(id) {
    fetch(`http://localhost:3000/tarefas/${id}`, {
        method: "DELETE"
    })
        .then(response => response.json())
        .then(response => {
            buscarTarefa();
        })
}

function pesquisarTarefa() {
    let lis = document.querySelectorAll("ul li")
    console.log(lis);

    if (busca.value.length > 0) {
        lis.forEach(li => {
            if (!li.children[0].innerText.includes(busca.value)) {
                li.classList.add('oculto');


            } else {
                li.classList.remove('oculto');
            }
        })

    } else {
        lis.forEach(li => {
            li.classList.remove('oculto');
        })

    }
}
