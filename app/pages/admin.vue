<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold">Painel Administrativo</h1>

    <!-- Admin Tabs -->
    <div class="tabs tabs-boxed">
      <a v-for="tab in adminTabs" :key="tab.value" @click="currentTab = tab.value"
        :class="['tab gap-2', currentTab === tab.value ? 'tab-active' : '']">
        <span class="text-xl">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </a>
    </div>

    <!-- Equipment Management -->
    <div v-if="currentTab === 'equipment'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Gerenciar Equipamentos</h2>
        <button @click="openNewEquipmentModal"
          class="btn btn-primary btn-md gap-2 shadow-lg hover:shadow-xl transition-all">
          🎤 Novo Equipamento
        </button>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- Filtros -->
          <div class="flex flex-wrap gap-4 mb-4">
            <input v-model="equipmentSearchFilter" type="text" placeholder="Buscar código ou nome..."
              class="input input-bordered input-sm w-60" />
            <select v-model="equipmentStatusFilter" class="select select-bordered select-sm w-40">
              <option value="">Todos os status</option>
              <option value="available">Disponível</option>
              <option value="reserved">Reservado</option>
              <option value="in_use">Em Uso</option>
              <option value="maintenance">Manutenção</option>
              <option value="excluded">Excluído</option>
            </select>
            <select v-model="equipmentCategoryFilter" class="select select-bordered select-sm w-40">
              <option value="">Todas as categorias</option>
              <option v-for="cat in equipmentCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Bag</th>
                  <th>Status</th>
                  <th>Evento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="equipment in filteredEquipment" :key="equipment.id">
                  <td class="font-mono font-bold">{{ equipment.code }}</td>
                  <td>{{ equipment.name }}</td>
                  <td>
                    <div class="badge badge-ghost">{{ equipment.category }}</div>
                  </td>
                  <td>
                    <span v-if="equipment.bag_id" class="font-mono text-sm text-primary">
                      {{ getBagCode(equipment.bag_id) }}
                    </span>
                    <span v-else class="text-base-content/40">-</span>
                  </td>
                  <td>
                    <div class="badge" :class="getEquipmentStatusClass(equipment.status)">
                      {{ getEquipmentStatusText(equipment.status) }}
                    </div>
                  </td>
                  <td>
                    <div v-if="['in_use', 'reserved'].includes(equipment.status) && equipment.current_event_id"
                      class="badge badge-warning gap-1">
                      <span>📅</span>
                      <span>{{ getEventName(equipment.current_event_id) }}</span>
                    </div>
                    <span v-else class="text-base-content/40">-</span>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button @click="editEquipment(equipment)" class="btn btn-ghost btn-xs">
                        ✏️
                      </button>
                      <button @click="deleteEquipment(equipment.id)" class="btn btn-ghost btn-xs text-error">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Bags Management -->
    <div v-if="currentTab === 'bags'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Gerenciar Bags</h2>
        <button @click="openNewBagModal"
          class="btn btn-primary btn-md gap-2 shadow-lg text-xl hover:shadow-xl transition-all">
          <img src="https://img.icons8.com/?size=100&id=4vFP3CsUgOmd&format=png&color=000000" alt="Bag Icon"
            class="w-6 h-6" />
          Nova Bag
        </button>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- Filtros -->
          <div class="flex flex-wrap gap-4 mb-4">
            <input v-model="bagSearchFilter" type="text" placeholder="Buscar código ou nome..."
              class="input input-bordered input-sm w-60" />
            <select v-model="bagStatusFilter" class="select select-bordered select-sm w-40">
              <option value="">Todos os status</option>
              <option value="available">Disponível</option>
              <option value="reserved">Reservada</option>
              <option value="in_use">Em Uso</option>
              <option value="excluded">Excluída</option>
            </select>
          </div>

          <div v-if="filteredBags.length === 0" class="text-center py-8">
            <div class="text-5xl mb-4">📦</div>
            <p class="text-base-content/60">Nenhuma bag cadastrada</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="bag in filteredBags" :key="bag.id" class="collapse collapse-arrow bg-base-200">
              <input type="checkbox" :id="`bag-${bag.id}`" />
              <div class="collapse-title">
                <div class="flex justify-between items-center pr-8">
                  <div class="flex items-center gap-4">
                    <div class="avatar placeholder">
                      <div class="bg-primary text-primary-content rounded-xl w-8 h-8">
                        <img src="https://img.icons8.com/?size=100&id=4vFP3CsUgOmd&format=png&color=000000"
                          alt="Bag Icon" />
                      </div>
                    </div>
                    <div>
                      <h3 class="font-bold text-lg">{{ bag.name }}</h3>
                      <p class="text-sm text-base-content/60 font-mono">{{ bag.code }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="badge badge-info">
                      {{ getBagEquipmentCount(bag.id) }} equipamentos
                    </div>
                    <div class="badge" :class="getBagStatusClass(bag.status)">
                      {{ getBagStatusText(bag.status) }}
                    </div>
                    <div v-if="['in_use', 'reserved'].includes(bag.status) && bag.current_event_id"
                      class="badge badge-warning gap-1">
                      <span>📅</span>
                      <span>{{ getEventName(bag.current_event_id) }}</span>
                    </div>
                    <span v-else class="text-base-content/40">-</span>
                  </div>
                </div>
              </div>
              <div class="collapse-content">
                <div class="pt-4 space-y-4">
                  <p v-if="bag.description" class="text-base-content/70">
                    {{ bag.description }}
                  </p>

                  <!-- Equipamentos na Bag -->
                  <div class="overflow-x-auto">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Nome</th>
                          <th>Categoria</th>
                          <th>Status</th>
                          <th>Condição</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="equipment in getBagEquipment(bag.id)" :key="equipment.id">
                          <td class="font-mono font-bold">{{ equipment.code }}</td>
                          <td>{{ equipment.name }}</td>
                          <td>
                            <div class="badge badge-ghost">{{ equipment.category }}</div>
                          </td>
                          <td>
                            <div class="badge" :class="getEquipmentStatusClass(equipment.status)">
                              {{ getEquipmentStatusText(equipment.status) }}
                            </div>
                          </td>
                          <td>{{ getConditionText(equipment.condition) }}</td>
                          <td>
                            <button @click="removeEquipmentFromBag(bag.id, equipment.id)"
                              class="btn btn-ghost btn-xs text-error" title="Remover da bag">
                              ✕
                            </button>
                          </td>
                        </tr>
                        <tr v-if="getBagEquipment(bag.id).length === 0">
                          <td colspan="6" class="text-center text-base-content/60 py-4">
                            Nenhum equipamento nesta bag
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Ações da Bag -->
                  <div class="flex justify-end gap-2 pt-2 border-t border-base-300">
                    <button @click="openAddEquipmentToBagModal(bag)" class="btn btn-success btn-sm">
                      ➕ Equipamento
                    </button>
                    <button @click="editBag(bag)" class="btn btn-ghost btn-sm">
                      ✏️ Editar
                    </button>
                    <button @click="deleteBag(bag.id)" class="btn btn-ghost btn-sm text-error">
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Events Management -->
    <div v-if="currentTab === 'events'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Gerenciar Eventos</h2>
        <button @click="openNewEventModal"
          class="btn btn-primary btn-md gap-2 shadow-lg hover:shadow-xl transition-all">
          📅 Novo Evento
        </button>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- Filtros -->
          <div class="flex flex-wrap gap-4 mb-4">
            <input v-model="eventSearchFilter" type="text" placeholder="Buscar código ou nome..."
              class="input input-bordered input-sm w-60" />
            <select v-model="eventStatusFilter" class="select select-bordered select-sm w-40">
              <option value="">Todos os status</option>
              <option value="planned">Planejado</option>
              <option value="confirmed">Confirmado</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <select v-model="eventTypeFilter" class="select select-bordered select-sm w-40">
              <option value="">Todos os tipos</option>
              <option v-for="type in eventTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <div v-if="filteredEvents.length === 0" class="text-center py-8">
            <div class="text-5xl mb-4">📅</div>
            <p class="text-base-content/60">Nenhum evento encontrado</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="event in filteredEvents" :key="event.id" class="collapse collapse-arrow bg-base-200">
              <input type="checkbox" :id="`event-${event.id}`" />
              <div class="collapse-title">
                <div class="flex justify-between items-center pr-8">
                  <div class="flex items-center gap-4">
                    <div class="avatar placeholder">
                      <div class="bg-secondary text-secondary-content rounded-lg w-12">
                        <span class="text-lg">📅</span>
                      </div>
                    </div>
                    <div>
                      <h3 class="font-bold text-lg">{{ event.name }}</h3>
                      <p class="text-sm text-base-content/60 font-mono">{{ event.code }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="badge badge-ghost">{{ event.type }}</div>
                    <div class="badge" :class="getEventStatusClass(event.status)">
                      {{ getEventStatusText(event.status) }}
                    </div>
                    <div class="text-sm text-base-content/60">
                      {{ formatEventDate(event.start_date) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="collapse-content">
                <div class="pt-4">
                  <div class="tabs tabs-boxed mb-4">
                    <a :class="['tab', eventTab === 'reserved' + event.id ? 'tab-active' : '']"
                      @click="eventTab = 'reserved' + event.id">
                      Reservados ({{ getReservedForEvent(event.id).length }})
                    </a>
                    <a :class="['tab', eventTab === 'withdrawn' + event.id ? 'tab-active' : '']"
                      @click="eventTab = 'withdrawn' + event.id">
                      Retirados ({{ getWithdrawnForEvent(event.id).length }})
                    </a>
                    <a :class="['tab', eventTab === 'returned' + event.id ? 'tab-active' : '']"
                      @click="eventTab = 'returned' + event.id">
                      Devolvidos ({{ getReturnedForEvent(event.id).length }})
                    </a>
                  </div>

                  <!-- Reserved Tab -->
                  <div v-if="eventTab === 'reserved' + event.id">
                    <div v-if="getReservedForEvent(event.id).length === 0"
                      class="text-center py-4 text-base-content/60">
                      Nenhum equipamento reservado
                    </div>
                    <div v-else class="overflow-x-auto">
                      <table class="table table-sm">
                        <thead>
                          <tr>
                            <th>Tipo</th>
                            <th>Equipamento/Bag</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, idx) in getReservedForEvent(event.id)"
                            :key="'reserved-' + event.id + '-' + idx">
                            <td>
                              <div class="badge badge-info">{{ item.type === 'equipment' ? 'Equipamento' : 'Bag' }}
                              </div>
                            </td>
                            <td>{{ item.type === 'equipment' ? getEquipmentNameById(item.equipment_id) :
                              getBagNameById(item.bag_id) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Withdrawn Tab -->
                  <div v-if="eventTab === 'withdrawn' + event.id">
                    <div v-if="getWithdrawnForEvent(event.id).length === 0"
                      class="text-center py-4 text-base-content/60">
                      Nenhum equipamento retirado
                    </div>
                    <div v-else class="overflow-x-auto">
                      <table class="table table-sm">
                        <thead>
                          <tr>
                            <th>Tipo</th>
                            <th>Equipamento/Bag</th>
                            <th>Retirado por</th>
                            <th>Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, idx) in getWithdrawnForEvent(event.id)"
                            :key="'withdrawn-' + event.id + '-' + idx">
                            <td>
                              <div class="badge badge-warning">{{ item.type === 'equipment' ? 'Equipamento' : 'Bag' }}
                              </div>
                            </td>
                            <td>{{ item.type === 'equipment' ? getEquipmentNameById(item.equipment_id) :
                              getBagNameById(item.bag_id) }}</td>
                            <td>{{ getUserNameById(item.user_id) }}</td>
                            <td>{{ formatEventDate(item.created_at) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Returned Tab -->
                  <div v-if="eventTab === 'returned' + event.id">
                    <div v-if="getReturnedForEvent(event.id).length === 0"
                      class="text-center py-4 text-base-content/60">
                      Nenhum equipamento devolvido
                    </div>
                    <div v-else class="overflow-x-auto">
                      <table class="table table-sm">
                        <thead>
                          <tr>
                            <th>Tipo</th>
                            <th>Equipamento/Bag</th>
                            <th>Devolvido por</th>
                            <th>Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, idx) in getReturnedForEvent(event.id)"
                            :key="'returned-' + event.id + '-' + idx">
                            <td>
                              <div class="badge badge-success">{{ item.type === 'equipment' ? 'Equipamento' : 'Bag' }}
                              </div>
                            </td>
                            <td>{{ item.type === 'equipment' ? getEquipmentNameById(item.equipment_id) :
                              getBagNameById(item.bag_id) }}</td>
                            <td>{{ getUserNameById(item.user_id) }}</td>
                            <td>{{ formatEventDate(item.created_at) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Ações do Evento -->
                  <div class="flex justify-end gap-2 pt-4 border-t border-base-300 mt-4">
                    <button @click="editEvent(event)" class="btn btn-ghost btn-sm">
                      ✏️ Editar
                    </button>
                    <button @click="deleteEvent(event.id)" class="btn btn-ghost btn-sm text-error">
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Management -->
    <div v-if="currentTab === 'users'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Gerenciar Usuários</h2>
        <button @click="openNewUserModal" class="btn btn-primary btn-md gap-2 shadow-lg hover:shadow-xl transition-all">
          👤 Novo Usuário
        </button>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- Filtros -->
          <div class="flex flex-wrap gap-4 mb-4">
            <input v-model="userSearchFilter" type="text" placeholder="Buscar usuário ou email..."
              class="input input-bordered input-sm w-60" />
            <select v-model="userRoleFilter" class="select select-bordered select-sm w-40">
              <option value="">Todas as funções</option>
              <option value="admin">Administrador</option>
              <option value="manager">Gerente</option>
              <option value="operator">Operador</option>
              <option value="viewer">Visualizador</option>
            </select>
            <select v-model="userStatusFilter" class="select select-bordered select-sm w-40">
              <option value="">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th></th>
                  <th>Usuário</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Função</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>
                    <div class="avatar" :class="{ 'placeholder': !getAvatarByUserId(user.id) }">
                      <div class="bg-neutral text-neutral-content rounded-full w-10 overflow-hidden">
                        <img v-if="getAvatarByUserId(user.id)" :src="getAvatarByUserId(user.id) ?? ''"
                          :alt="user.username" class="w-full h-full object-cover" />
                        <span v-else class="text-sm">{{ user.username.charAt(0).toUpperCase() }}</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <div class="badge" :class="user.is_active ? 'badge-success' : 'badge-error'">
                      {{ user.is_active ? 'Ativo' : 'Inativo' }}
                    </div>
                  </td>
                  <td>
                    <div class="badge" :class="getRoleBadgeClass(user.role)">
                      {{ getRoleText(user.role) }}
                    </div>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button @click="editUser(user)" class="btn btn-ghost btn-xs">
                        ✏️
                      </button>
                      <button v-if="user.id !== authStore.user?.id" @click="deleteUser(user.id)"
                        class="btn btn-ghost btn-xs text-error">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Audit Log -->
    <div v-if="currentTab === 'audit'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Log de Auditoria</h2>
        <button @click="loadAuditLog()" class="btn btn-ghost btn-sm" :class="{ 'loading': auditLoading }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      <!-- Summary Cards -->
      <div v-if="auditSummary" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="stat bg-base-100 rounded-box shadow">
          <div class="stat-title">Total de Registros</div>
          <div class="stat-value text-primary">{{ auditSummary.total }}</div>
        </div>
        <div class="stat bg-base-100 rounded-box shadow">
          <div class="stat-title">Por Ação</div>
          <div class="stat-desc text-sm mt-2">
            <div v-for="item in auditSummary.by_action" :key="item.action" class="flex justify-between">
              <span class="badge" :class="getAuditActionClass(item.action)">{{ getAuditActionText(item.action) }}</span>
              <span class="font-bold">{{ item.count }}</span>
            </div>
          </div>
        </div>
        <div class="stat bg-base-100 rounded-box shadow">
          <div class="stat-title">Por Tabela</div>
          <div class="stat-desc text-sm mt-2">
            <div v-for="item in auditSummary.by_table" :key="item.table" class="flex justify-between">
              <span class="badge badge-ghost">{{ getTableName(item.table) }}</span>
              <span class="font-bold">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card bg-base-100 shadow">
        <div class="card-body py-4">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Tabela</span>
              </label>
              <select v-model="auditFilters.table_name" class="select select-bordered select-sm">
                <option value="">Todas</option>
                <option value="transactions">Transações</option>
                <option value="equipment">Equipamentos</option>
                <option value="events">Eventos</option>
                <option value="users">Usuários</option>
                <option value="bags">Bags</option>
                <option value="reservations">Reservas</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Ação</span>
              </label>
              <select v-model="auditFilters.action" class="select select-bordered select-sm">
                <option value="">Todas</option>
                <option value="INSERT">Inserção</option>
                <option value="UPDATE">Atualização</option>
                <option value="DELETE">Exclusão</option>
              </select>
            </div>
            <button @click="loadAuditLog()" class="btn btn-primary btn-sm">
              Filtrar
            </button>
            <button @click="clearAuditFilters" class="btn btn-ghost btn-sm">
              Limpar
            </button>
          </div>
        </div>
      </div>

      <!-- Audit Log Table -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div v-if="auditLoading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>

          <div v-else-if="auditLogs.length === 0" class="text-center py-8">
            <div class="text-5xl mb-4">📋</div>
            <p class="text-base-content/60">Nenhum registro de auditoria encontrado</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Ação</th>
                  <th>Tabela</th>
                  <th>Registro</th>
                  <th>Usuário</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in auditLogs" :key="log.id">
                  <td class="whitespace-nowrap">
                    <div class="text-sm">{{ formatDateTimeBR(log.created_at) }}</div>
                  </td>
                  <td>
                    <div class="badge" :class="getAuditActionClass(log.action)">
                      {{ getAuditActionText(log.action) }}
                    </div>
                  </td>
                  <td>
                    <div class="badge badge-ghost">{{ getTableName(log.table_name) }}</div>
                  </td>
                  <td>
                    <span class="font-mono text-xs">{{ log.record_id.substring(0, 8) }}...</span>
                  </td>
                  <td>
                    <span v-if="log.user_id" class="text-sm">
                      {{ getUserName(log.user_id) }}
                    </span>
                    <span v-else class="text-base-content/40">Sistema</span>
                  </td>
                  <td>
                    <button @click="showAuditDetails(log)" class="btn btn-ghost btn-xs">
                      Ver
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="auditLogs.length > 0" class="flex justify-center gap-2 mt-4">
            <button @click="loadAuditLog(auditPage - 1)" :disabled="auditPage <= 1" class="btn btn-sm btn-ghost">
              Anterior
            </button>
            <span class="btn btn-sm btn-ghost no-animation">Página {{ auditPage }}</span>
            <button @click="loadAuditLog(auditPage + 1)" :disabled="auditLogs.length < auditLimit"
              class="btn btn-sm btn-ghost">
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Audit Details Modal -->
    <Modal id="audit-details-modal" title="Detalhes da Auditoria" v-model="showAuditModal" size="lg">
      <div v-if="selectedAuditLog" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label"><span class="label-text font-bold">Data/Hora</span></label>
            <p>{{ formatDateTimeBR(selectedAuditLog.created_at) }}</p>
          </div>
          <div>
            <label class="label"><span class="label-text font-bold">Ação</span></label>
            <div class="badge" :class="getAuditActionClass(selectedAuditLog.action)">
              {{ getAuditActionText(selectedAuditLog.action) }}
            </div>
          </div>
          <div>
            <label class="label"><span class="label-text font-bold">Tabela</span></label>
            <p>{{ getTableName(selectedAuditLog.table_name) }}</p>
          </div>
          <div>
            <label class="label"><span class="label-text font-bold">ID do Registro</span></label>
            <p class="font-mono text-sm break-all">{{ selectedAuditLog.record_id }}</p>
          </div>
          <div>
            <label class="label"><span class="label-text font-bold">Usuário</span></label>
            <p>{{ selectedAuditLog.user_id ? getUserName(selectedAuditLog.user_id) : 'Sistema' }}</p>
          </div>
          <div>
            <label class="label"><span class="label-text font-bold">IP</span></label>
            <p class="font-mono text-sm">{{ selectedAuditLog.ip_address || '-' }}</p>
          </div>
        </div>

        <div v-if="selectedAuditLog.old_values" class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title font-medium">
            Valores Antigos
          </div>
          <div class="collapse-content">
            <pre
              class="text-xs overflow-auto bg-base-300 p-2 rounded">{{ JSON.stringify(selectedAuditLog.old_values, null, 2) }}</pre>
          </div>
        </div>

        <div v-if="selectedAuditLog.new_values" class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" checked />
          <div class="collapse-title font-medium">
            Valores Novos
          </div>
          <div class="collapse-content">
            <pre
              class="text-xs overflow-auto bg-base-300 p-2 rounded">{{ JSON.stringify(selectedAuditLog.new_values, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Settings -->
    <div v-if="currentTab === 'settings'" class="space-y-6">
      <h2 class="text-2xl font-bold">Configurações do Sistema</h2>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">Preferências Gerais</h3>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Modo Escuro Padrão</span>
              <input type="checkbox" class="toggle toggle-primary" />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Notificações de Email</span>
              <input type="checkbox" class="toggle toggle-primary" checked />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Requer Aprovação para Retiradas</span>
              <input type="checkbox" class="toggle toggle-primary" />
            </label>
          </div>

          <div class="divider"></div>

          <h3 class="card-title text-error">Zona de Perigo</h3>

          <div class="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>As ações abaixo são irreversíveis. Use com cautela.</span>
          </div>

          <div class="flex flex-col gap-2">
            <button @click="resetData" class="btn btn-warning">
              Resetar Dados de Teste
            </button>
            <button @click="exportData" class="btn btn-info">
              Exportar Todos os Dados
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Equipment Modal -->
    <Modal id="equipment-modal" :title="editingEquipment ? 'Editar Equipamento' : 'Novo Equipamento'"
      v-model="showEquipmentModal" size="lg">
      <form @submit.prevent="saveEquipment" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <FormInput v-model="equipmentForm.name" label="Nome" required />
          <FormInput v-model="equipmentForm.code" label="Código" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <FormInput v-model="equipmentForm.category" label="Categoria" required />
          <FormInput v-model="equipmentForm.location" label="Localização" />
        </div>

        <FormSelect v-model="equipmentForm.status" label="Status" :options="statusOptionsEquipment" required />

        <FormSelect v-model="equipmentForm.bag_id" label="Bag" :options="bagOptions"
          placeholder="Selecione uma bag (opcional)" />

        <FormTextarea v-model="equipmentForm.description" label="Descrição" :rows="3" />

        <div class="flex justify-end gap-2">
          <button type="button" @click="showEquipmentModal = false" class="btn btn-ghost">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingEquipment ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Bag Modal -->
    <Modal id="bag-modal" :title="editingBag ? 'Editar Bag' : 'Nova Bag'" v-model="showBagModal">
      <form @submit.prevent="saveBag" class="space-y-4">
        <FormInput v-model="bagForm.name" label="Nome" placeholder="Ex: Kit Microfones Vocais" required />

        <FormInput v-model="bagForm.code" label="Código" placeholder="Ex: BAG-MIC-01" required />

        <FormTextarea v-model="bagForm.description" label="Descrição" placeholder="Descrição da bag e seu conteúdo..."
          :rows="3" />

        <FormSelect v-if="editingBag" v-model="bagForm.status" label="Status" :options="statusOptionsBag" required />

        <div class="flex justify-end gap-2">
          <button type="button" @click="showBagModal = false" class="btn btn-ghost">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingBag ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Add Equipment to Bag Modal -->
    <Modal id="add-equipment-to-bag-modal" title="Adicionar Equipamento à Bag" v-model="showAddEquipmentToBagModal">
      <div class="space-y-4">
        <!-- Bag Info -->
        <div v-if="selectedBagForEquipment" class="bg-base-200 rounded-lg p-4">
          <div class="flex items-center gap-3">
            <div class="text-3xl">📦</div>
            <div>
              <h4 class="font-bold">{{ selectedBagForEquipment.name }}</h4>
              <p class="text-sm text-base-content/60 font-mono">{{ selectedBagForEquipment.code }}</p>
            </div>
          </div>
        </div>

        <!-- Equipment Code Input -->
        <form @submit.prevent="addEquipmentToBag" class="space-y-4">
          <FormInput v-model="addEquipmentCode" label="Código do Equipamento"
            placeholder="Digite ou escaneie o código (ex: MIC-001)" required :error="addEquipmentError" />

          <!-- Error Message -->
          <div v-if="addEquipmentError" class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ addEquipmentError }}</span>
          </div>

          <div class="flex justify-end gap-2">
            <button type="button" @click="showAddEquipmentToBagModal = false" class="btn btn-ghost"
              :disabled="addEquipmentLoading">
              Cancelar
            </button>
            <button type="submit" class="btn btn-success" :disabled="addEquipmentLoading || !addEquipmentCode.trim()">
              <span v-if="addEquipmentLoading" class="loading loading-spinner loading-sm"></span>
              {{ addEquipmentLoading ? 'Adicionando...' : 'Adicionar' }}
            </button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- User Modal -->
    <Modal id="user-modal" :title="editingUser ? 'Editar Usuário' : 'Novo Usuário'" v-model="showUserModal">
      <form @submit.prevent="saveUser" class="space-y-4">
        <FormInput v-model="userForm.email" label="Email" type="email" required />

        <FormInput v-model="userForm.username" label="Usuário" required />

        <FormInput v-if="!editingUser" v-model="userForm.password" label="Senha" type="password" required
          minlength="8" />

        <FormSelect v-model="userForm.role" label="Função" :options="roleOptions" required />

        <div class="flex justify-end gap-2">
          <button type="button" @click="showUserModal = false" class="btn btn-ghost">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingUser ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Event Modal -->
    <Modal id="event-modal" :title="editingEvent ? 'Editar Evento' : 'Novo Evento'" v-model="showEventModal" size="lg">
      <form @submit.prevent="saveEvent" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <FormInput v-model="eventForm.name" label="Nome" required />
          <FormInput v-model="eventForm.code" label="Código" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <FormInput v-model="eventForm.type" label="Tipo" placeholder="Ex: Show, Casamento, Corporativo" required />
          <FormInput v-model="eventForm.category" label="Categoria" placeholder="Ex: Festival, Social, Conferência" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <FormInput v-model="eventForm.start_date" label="Data/Hora Início" type="datetime-local" required />
          <FormInput v-model="eventForm.end_date" label="Data/Hora Fim" type="datetime-local" required />
        </div>

        <FormInput v-model="eventForm.location" label="Local" placeholder="Ex: Centro de Convenções, São Paulo" />

        <FormSelect v-model="eventForm.status" label="Status" :options="statusOptionsEvent" required />

        <FormTextarea v-model="eventForm.description" label="Descrição" :rows="3" />

        <div class="flex justify-end gap-2">
          <button type="button" @click="showEventModal = false" class="btn btn-ghost">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingEvent ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import type { Equipment, User, Event, Bag, UserRole, EquipmentStatus, EventStatus, EquipmentCondition, BagStatus, AuditLog, AuditLogSummary } from "~/types";
import { authService } from "~/services/api/auth";
import { userService } from "~/services/api/users";
import { bagService } from "~/services/api/bags";
import { reportService } from "~/services/api/reports";
import { formatDateTimeBR } from "~/utils/dateUtils";
import { useUserAvatar } from "~/composables/useUserAvatar";

definePageMeta({
  middleware: ["auth", "admin"],
});

const appStore = useAppStore();
const authStore = useAuthStore();
const { getAvatarByUserId } = useUserAvatar();

// Carregar dados ao montar o componente
onMounted(async () => {
  await Promise.all([
    appStore.fetchEquipment(),
    appStore.fetchUsers(),
    appStore.fetchEvents(),
    appStore.fetchBags(),
    appStore.fetchReservations(),
    appStore.fetchTransactions(),
  ]);
});

const currentTab = ref("equipment");
const eventTab = ref("");
const showEquipmentModal = ref(false);
const showUserModal = ref(false);
const showEventModal = ref(false);
const showBagModal = ref(false);
const showAddEquipmentToBagModal = ref(false);
const selectedBagForEquipment = ref<Bag | null>(null);
const addEquipmentCode = ref("");
const addEquipmentError = ref("");
const addEquipmentLoading = ref(false);
const editingEquipment = ref<Equipment | null>(null);
const editingUser = ref<User | null>(null);
const editingEvent = ref<Event | null>(null);
const editingBag = ref<Bag | null>(null);

// Filtros para Equipment
const equipmentSearchFilter = ref("");
const equipmentStatusFilter = ref("");
const equipmentCategoryFilter = ref("");

// Filtros para Bags
const bagSearchFilter = ref("");
const bagStatusFilter = ref("");

// Filtros para Events
const eventSearchFilter = ref("");
const eventStatusFilter = ref("");
const eventTypeFilter = ref("");

// Filtros para Users
const userSearchFilter = ref("");
const userRoleFilter = ref("");
const userStatusFilter = ref("");

// Computed para categorias únicas de equipamentos
const equipmentCategories = computed(() => {
  const categories = new Set(appStore.equipment.map(e => e.category));
  return Array.from(categories).sort();
});

// Computed para tipos únicos de eventos
const eventTypes = computed(() => {
  const types = new Set(appStore.events.map(e => e.type));
  return Array.from(types).sort();
});

// Filtered Equipment
const filteredEquipment = computed(() => {
  let result = appStore.equipment;

  if (equipmentSearchFilter.value) {
    const search = equipmentSearchFilter.value.toLowerCase();
    result = result.filter(e =>
      e.code.toLowerCase().includes(search) ||
      e.name.toLowerCase().includes(search)
    );
  }

  if (equipmentStatusFilter.value) {
    result = result.filter(e => e.status === equipmentStatusFilter.value);
  }

  if (equipmentCategoryFilter.value) {
    result = result.filter(e => e.category === equipmentCategoryFilter.value);
  }

  return result;
});

// Filtered Bags
const filteredBags = computed(() => {
  let result = appStore.bags;

  if (bagSearchFilter.value) {
    const search = bagSearchFilter.value.toLowerCase();
    result = result.filter(b =>
      b.code.toLowerCase().includes(search) ||
      b.name.toLowerCase().includes(search)
    );
  }

  if (bagStatusFilter.value) {
    result = result.filter(b => b.status === bagStatusFilter.value);
  }

  return result;
});

// Filtered Events
const filteredEvents = computed(() => {
  let result = appStore.events;

  if (eventSearchFilter.value) {
    const search = eventSearchFilter.value.toLowerCase();
    result = result.filter(e =>
      e.code.toLowerCase().includes(search) ||
      e.name.toLowerCase().includes(search)
    );
  }

  if (eventStatusFilter.value) {
    result = result.filter(e => e.status === eventStatusFilter.value);
  }

  if (eventTypeFilter.value) {
    result = result.filter(e => e.type === eventTypeFilter.value);
  }

  return result;
});

// Filtered Users
const filteredUsers = computed(() => {
  let result = appStore.users;

  if (userSearchFilter.value) {
    const search = userSearchFilter.value.toLowerCase();
    result = result.filter(u =>
      u.username.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  }

  if (userRoleFilter.value) {
    result = result.filter(u => u.role === userRoleFilter.value);
  }

  if (userStatusFilter.value) {
    if (userStatusFilter.value === 'active') {
      result = result.filter(u => u.is_active);
    } else if (userStatusFilter.value === 'inactive') {
      result = result.filter(u => !u.is_active);
    }
  }

  return result;
});

const adminTabs = [
  { value: "equipment", label: "Equipamentos", icon: "🎤" },
  { value: "bags", label: "Bags", icon: "🧳" },
  { value: "events", label: "Eventos", icon: "📅" },
  { value: "users", label: "Usuários", icon: "👥" },
  { value: "audit", label: "Auditoria", icon: "📋" },
  { value: "settings", label: "Configurações", icon: "⚙️" },
];

const equipmentForm = ref({
  name: "",
  code: "",
  category: "",
  location: "",
  status: "available" as EquipmentStatus,
  condition: "good" as EquipmentCondition,
  description: "",
  bag_id: "" as string,
});

const userForm = ref({
  email: "",
  username: "",
  password: "",
  role: "operator" as UserRole,
});

const eventForm = ref({
  name: "",
  code: "",
  type: "",
  category: "",
  start_date: "",
  end_date: "",
  location: "",
  status: "planned" as EventStatus,
  description: "",
});

const bagForm = ref({
  name: "",
  code: "",
  description: "",
  status: "available" as BagStatus,
});

const statusOptionsBag = [
  { value: "available", label: "Disponível" },
  { value: "reserved", label: "Reservada" },
  { value: "in_use", label: "Em Uso" },
  { value: "excluded", label: "Excluída" },
];

const statusOptionsEquipment = [
  { value: "available", label: "Disponível" },
  { value: "reserved", label: "Reservado" },
  { value: "in_use", label: "Em Uso" },
  { value: "maintenance", label: "Manutenção" },
  { value: "excluded", label: "Excluído" },
];

const statusOptionsEvent = [
  { value: "planned", label: "Planejado" },
  { value: "confirmed", label: "Confirmado" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
];

const roleOptions = [
  { value: "viewer", label: "Visualizador" },
  { value: "operator", label: "Operador" },
  { value: "manager", label: "Gerente" },
  { value: "admin", label: "Administrador" },
];

// Audit Log State
const auditLogs = ref<AuditLog[]>([]);
const auditSummary = ref<AuditLogSummary | null>(null);
const auditLoading = ref(false);
const auditPage = ref(1);
const auditLimit = 20;
const showAuditModal = ref(false);
const selectedAuditLog = ref<AuditLog | null>(null);
const auditFilters = ref({
  table_name: "",
  action: "",
});

// Audit Log Functions
const loadAuditLog = async (page: number = 1) => {
  auditLoading.value = true;
  auditPage.value = page;
  try {
    const [logs, summary] = await Promise.all([
      reportService.getAuditLog({
        skip: (page - 1) * auditLimit,
        limit: auditLimit,
        table_name: auditFilters.value.table_name || undefined,
        action: auditFilters.value.action as any || undefined,
      }),
      reportService.getAuditLogSummary(),
    ]);
    auditLogs.value = logs;
    auditSummary.value = summary;
  } catch (error) {
    console.error("Erro ao carregar audit log:", error);
  } finally {
    auditLoading.value = false;
  }
};

const clearAuditFilters = () => {
  auditFilters.value = { table_name: "", action: "" };
  loadAuditLog(1);
};

const showAuditDetails = (log: AuditLog) => {
  selectedAuditLog.value = log;
  showAuditModal.value = true;
};

const getAuditActionClass = (action: string) => {
  const classes: Record<string, string> = {
    INSERT: "badge-success",
    UPDATE: "badge-warning",
    DELETE: "badge-error",
  };
  return classes[action] || "badge-ghost";
};

const getAuditActionText = (action: string) => {
  const texts: Record<string, string> = {
    INSERT: "Inserção",
    UPDATE: "Atualização",
    DELETE: "Exclusão",
  };
  return texts[action] || action;
};

const getTableName = (table: string) => {
  const names: Record<string, string> = {
    transactions: "Transações",
    equipment: "Equipamentos",
    events: "Eventos",
    users: "Usuários",
    bags: "Bags",
    reservations: "Reservas",
    audit_log: "Auditoria",
  };
  return names[table] || table;
};

const getUserName = (userId: string) => {
  const user = appStore.users.find((u) => u.id === userId);
  return user?.username || userId.substring(0, 8) + "...";
};

// Watch para carregar audit log quando mudar para a aba
watch(currentTab, (newTab) => {
  if (newTab === "audit" && auditLogs.value.length === 0) {
    loadAuditLog();
  }
});

// Computed para opções de bags no select
const bagOptions = computed(() => {
  const options = [{ value: "", label: "Sem bag (avulso)" }];
  appStore.bags
    .filter((bag) => bag.status !== "excluded")
    .forEach((bag) => {
      options.push({
        value: bag.id,
        label: `${bag.name} (${bag.code})`,
      });
    });
  return options;
});

const openNewEquipmentModal = () => {
  editingEquipment.value = null;
  equipmentForm.value = {
    name: "",
    code: "",
    category: "",
    location: "",
    status: "available" as EquipmentStatus,
    condition: "good" as EquipmentCondition,
    description: "",
    bag_id: "",
  };
  showEquipmentModal.value = true;
};

const editEquipment = (equipment: Equipment) => {
  editingEquipment.value = equipment;
  equipmentForm.value = {
    name: equipment.name,
    code: equipment.code,
    category: equipment.category,
    location: equipment.location || "",
    status: equipment.status,
    condition: equipment.condition,
    description: equipment.description || "",
    bag_id: equipment.bag_id || "",
  };
  showEquipmentModal.value = true;
};

const saveEquipment = async () => {
  try {
    const equipmentData: any = {
      name: equipmentForm.value.name,
      code: equipmentForm.value.code,
      category: equipmentForm.value.category,
      status: equipmentForm.value.status,
      condition: equipmentForm.value.condition,
      location: equipmentForm.value.location || undefined,
      description: equipmentForm.value.description || undefined,
    };

    // Para edição, sempre enviar bag_id (null para limpar ou o valor)
    if (editingEquipment.value) {
      equipmentData.bag_id = equipmentForm.value.bag_id || null;
      await appStore.updateEquipment(editingEquipment.value.id, equipmentData);
    } else {
      // Para criação, só enviar se tiver valor
      if (equipmentForm.value.bag_id) {
        equipmentData.bag_id = equipmentForm.value.bag_id;
      }
      await appStore.addEquipment(equipmentData);
    }

    showEquipmentModal.value = false;
    // Recarregar lista
    await appStore.fetchEquipment();
  } catch (error: any) {
    alert(error.message || "Erro ao salvar equipamento");
  }
};

const deleteEquipment = async (id: string) => {
  if (confirm("Tem certeza que deseja excluir este equipamento?")) {
    try {
      await appStore.deleteEquipment(id);
      await appStore.fetchEquipment();
    } catch (error: any) {
      alert(error.message || "Erro ao deletar equipamento");
    }
  }
};

const openNewUserModal = () => {
  editingUser.value = null;
  userForm.value = {
    email: "",
    username: "",
    password: "",
    role: "operator" as UserRole,
  };
  showUserModal.value = true;
};

const editUser = (user: User) => {
  editingUser.value = user;
  userForm.value = {
    email: user.email,
    username: user.username,
    password: "",
    role: user.role,
  };
  showUserModal.value = true;
};

const saveUser = async () => {
  try {
    if (editingUser.value) {
      await userService.update(editingUser.value.id, {
        email: userForm.value.email,
        role: userForm.value.role,
      });
    } else {
      await authService.register({
        email: userForm.value.email,
        username: userForm.value.username,
        password: userForm.value.password,
        role: userForm.value.role,
      });
    }
    await appStore.fetchUsers();
    showUserModal.value = false;
  } catch (error: any) {
    alert(error?.message || "Erro ao salvar usuário");
  }
};

const deleteUser = async (id: string) => {
  if (confirm("Tem certeza que deseja excluir este usuário?")) {
    try {
      await userService.delete(id);
      await appStore.fetchUsers();
    } catch (error: any) {
      alert(error?.message || "Erro ao excluir usuário");
    }
  }
};

// ===== EVENT FUNCTIONS =====
const formatDateTimeLocal = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 16);
};

const openNewEventModal = () => {
  editingEvent.value = null;
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
  eventForm.value = {
    name: "",
    code: "",
    type: "",
    category: "",
    start_date: now.toISOString().slice(0, 16),
    end_date: inOneHour.toISOString().slice(0, 16),
    location: "",
    status: "planned" as EventStatus,
    description: "",
  };
  showEventModal.value = true;
};

const editEvent = (event: Event) => {
  editingEvent.value = event;
  eventForm.value = {
    name: event.name,
    code: event.code,
    type: event.type,
    category: event.category || "",
    start_date: formatDateTimeLocal(event.start_date),
    end_date: formatDateTimeLocal(event.end_date),
    location: event.location || "",
    status: event.status,
    description: event.description || "",
  };
  showEventModal.value = true;
};

const saveEvent = async () => {
  try {
    const eventData = {
      name: eventForm.value.name,
      code: eventForm.value.code,
      type: eventForm.value.type,
      category: eventForm.value.category || undefined,
      start_date: new Date(eventForm.value.start_date).toISOString(),
      end_date: new Date(eventForm.value.end_date).toISOString(),
      location: eventForm.value.location || undefined,
      status: eventForm.value.status,
      description: eventForm.value.description || undefined,
    };

    if (editingEvent.value) {
      await appStore.updateEvent(editingEvent.value.id, eventData);
    } else {
      await appStore.addEvent(eventData);
    }

    showEventModal.value = false;
    await appStore.fetchEvents();
  } catch (error: any) {
    alert(error?.message || "Erro ao salvar evento");
  }
};

const deleteEvent = async (id: string) => {
  if (confirm("Tem certeza que deseja excluir este evento?")) {
    try {
      await appStore.deleteEvent(id);
      await appStore.fetchEvents();
    } catch (error: any) {
      alert(error?.message || "Erro ao excluir evento");
    }
  }
};

const formatEventDate = (date: string) => formatDateTimeBR(date);

const getEventStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    planned: "badge-info",
    confirmed: "badge-primary",
    in_progress: "badge-warning",
    completed: "badge-success",
    cancelled: "badge-error",
  };
  return classes[status] || "badge-ghost";
};

const getEventStatusText = (status: string) => {
  const texts: Record<string, string> = {
    planned: "Planejado",
    confirmed: "Confirmado",
    in_progress: "Em Andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
  };
  return texts[status] || status;
};

const resetData = () => {
  if (
    confirm(
      "Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita."
    )
  ) {
    location.reload();
  }
};

const exportData = () => {
  const data = {
    equipment: appStore.equipment,
    events: appStore.events,
    transactions: appStore.transactions,
    users: appStore.users,
    bags: appStore.bags,
    reservations: appStore.reservations,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `asset-manager-export-${new Date().toISOString()}.json`;
  a.click();
};

const getEquipmentStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    available: "badge-success",
    reserved: "badge-info",
    in_use: "badge-warning",
    maintenance: "badge-warning",
    excluded: "badge-neutral",
    damaged: "badge-error",
  };
  return classes[status] || "badge-ghost";
};

const getEquipmentStatusText = (status: string) => {
  const texts: Record<string, string> = {
    available: "Disponível",
    reserved: "Reservado",
    in_use: "Em Uso",
    maintenance: "Manutenção",
    excluded: "Excluído",
    damaged: "Danificado",
  };
  return texts[status] || status;
};

const getBagStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    available: "badge-success",
    reserved: "badge-info",
    in_use: "badge-warning",
    excluded: "badge-neutral",
  };
  return classes[status] || "badge-ghost";
};

const getBagStatusText = (status: string) => {
  const texts: Record<string, string> = {
    available: "Disponível",
    reserved: "Reservada",
    in_use: "Em Uso",
    excluded: "Excluída",
  };
  return texts[status] || status;
};

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    admin: "badge-primary",
    manager: "badge-secondary",
    operator: "badge-accent",
    viewer: "badge-ghost",
  };
  return classes[role] || "badge-ghost";
};

const getRoleText = (role: string) => {
  const texts: Record<string, string> = {
    admin: "Administrador",
    manager: "Gerente",
    operator: "Operador",
    viewer: "Visualizador",
  };
  return texts[role] || role;
};

// ===== BAG FUNCTIONS =====
const getBagEquipment = (bagId: string) => {
  return appStore.equipment.filter((e) => e.bag_id === bagId);
};

const getBagEquipmentCount = (bagId: string) => {
  return getBagEquipment(bagId).length;
};

const getBagCode = (bagId: string) => {
  const bag = appStore.bags.find((b) => b.id === bagId);
  return bag?.code || "-";
};

const getConditionText = (condition: string) => {
  const texts: Record<string, string> = {
    excellent: "Excelente",
    good: "Bom",
    fair: "Regular",
    poor: "Ruim",
    damaged: "Danificado",
  };
  return texts[condition] || condition;
};

const getEventName = (eventId: string | undefined) => {
  if (!eventId) return null;
  const event = appStore.events.find((e) => e.id === eventId);
  return event?.name || null;
};

// ===== EVENT TRANSACTIONS FUNCTIONS =====
const getReservedForEvent = (eventId: string) => {
  return appStore.reservations
    .filter((r) => r.event_id === eventId && r.status === 'active')
    .map((r) => ({
      equipment_id: r.equipment_id,
      bag_id: r.bag_id,
      type: r.equipment_id ? 'equipment' : 'bag'
    }));
};

const getWithdrawnForEvent = (eventId: string) => {
  return appStore.transactions
    .filter((t) => t.event_id === eventId &&
      String(t.transaction_type).toLowerCase() === 'withdrawal' &&
      t.status === 'completed')
    .map((t) => ({
      equipment_id: t.equipment_id,
      bag_id: t.bag_id,
      type: t.equipment_id ? 'equipment' : 'bag',
      user_id: t.user_id,
      created_at: t.created_at
    }));
};

const getReturnedForEvent = (eventId: string) => {
  return appStore.transactions
    .filter((t) => t.event_id === eventId &&
      String(t.transaction_type).toLowerCase() === 'return')
    .map((t) => ({
      equipment_id: t.equipment_id,
      bag_id: t.bag_id,
      type: t.equipment_id ? 'equipment' : 'bag',
      user_id: t.user_id,
      created_at: t.created_at
    }));
};

const getEquipmentNameById = (equipmentId: string | undefined) => {
  if (!equipmentId) return null;
  const eq = appStore.equipment.find((e) => e.id === equipmentId);
  return eq ? `${eq.code} - ${eq.name}` : null;
};

const getBagNameById = (bagId: string | undefined) => {
  if (!bagId) return null;
  const bag = appStore.bags.find((b) => b.id === bagId);
  return bag ? `${bag.code} - ${bag.name}` : null;
};

const getUserNameById = (userId: string | undefined) => {
  if (!userId) return null;
  const user = appStore.users.find((u) => u.id === userId);
  return user?.username || null;
};

const openNewBagModal = () => {
  editingBag.value = null;
  bagForm.value = {
    name: "",
    code: "",
    description: "",
    status: "available" as BagStatus,
  };
  showBagModal.value = true;
};

const editBag = (bag: Bag) => {
  editingBag.value = bag;
  bagForm.value = {
    name: bag.name,
    code: bag.code,
    description: bag.description || "",
    status: bag.status || "available" as BagStatus,
  };
  showBagModal.value = true;
};

const saveBag = async () => {
  try {
    const bagData: any = {
      name: bagForm.value.name,
      code: bagForm.value.code,
      description: bagForm.value.description || undefined,
    };

    // Incluir status apenas na edição
    if (editingBag.value) {
      bagData.status = bagForm.value.status;
    }

    if (editingBag.value) {
      await appStore.updateBag(editingBag.value.id, bagData);
    } else {
      await appStore.addBag(bagData);
    }

    showBagModal.value = false;
    await appStore.fetchBags();
  } catch (error: any) {
    alert(error?.message || "Erro ao salvar bag");
  }
};

const deleteBag = async (id: string) => {
  const equipmentCount = getBagEquipmentCount(id);
  const confirmMsg = equipmentCount > 0
    ? `Esta bag contém ${equipmentCount} equipamento(s). Tem certeza que deseja excluí-la?`
    : "Tem certeza que deseja excluir esta bag?";

  if (confirm(confirmMsg)) {
    try {
      await appStore.deleteBag(id);
      await appStore.fetchBags();
    } catch (error: any) {
      alert(error?.message || "Erro ao excluir bag");
    }
  }
};

const openAddEquipmentToBagModal = (bag: Bag) => {
  selectedBagForEquipment.value = bag;
  addEquipmentCode.value = "";
  addEquipmentError.value = "";
  addEquipmentLoading.value = false;
  showAddEquipmentToBagModal.value = true;
};

const addEquipmentToBag = async () => {
  if (!selectedBagForEquipment.value || !addEquipmentCode.value.trim()) {
    addEquipmentError.value = "Informe o código do equipamento";
    return;
  }

  addEquipmentLoading.value = true;
  addEquipmentError.value = "";

  try {
    await bagService.addEquipment(
      selectedBagForEquipment.value.id,
      addEquipmentCode.value.trim()
    );

    // Refresh data
    await appStore.fetchEquipment();
    await appStore.fetchBags();

    // Success - close modal
    showAddEquipmentToBagModal.value = false;
    addEquipmentCode.value = "";
  } catch (error: any) {
    const message = error?.data?.detail || error?.message || "Erro ao adicionar equipamento à bag";
    addEquipmentError.value = message;
  } finally {
    addEquipmentLoading.value = false;
  }
};

const removeEquipmentFromBag = async (bagId: string, equipmentId: string) => {
  if (!confirm("Tem certeza que deseja remover este equipamento da bag?")) {
    return;
  }

  try {
    await bagService.removeEquipment(bagId, equipmentId);
    await appStore.fetchEquipment();
    await appStore.fetchBags();
  } catch (error: any) {
    alert(error?.data?.detail || error?.message || "Erro ao remover equipamento da bag");
  }
};
</script>
