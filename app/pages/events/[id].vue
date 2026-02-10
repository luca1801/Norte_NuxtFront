<template>
  <div class="space-y-6 w-full">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button @click="goBack" class="btn btn-circle btn-ghost">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-3xl font-bold flex-1">{{ event?.name }}</h1>
      <button @click="openEditModal" class="btn btn-primary">
        Editar Evento
      </button>
    </div>

    <!-- Event Info Card -->
    <div class="card bg-base-100 shadow-xl w-full">
      <div class="card-body">
        <!-- Status Badge no topo -->
        <div class="flex items-center justify-between mb-4">
          <div class="badge badge-lg gap-2" :class="getStatusClass(event?.status)">
            {{ getStatusText(event?.status) }}
          </div>
          <span class="text-sm text-base-content/60">Código: <span class="font-mono font-semibold">{{ event?.code
              }}</span></span>
        </div>

        <!-- Informações principais em grid elegante -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Tipo -->
          <div class="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              🎤
            </div>
            <div>
              <p class="text-xs text-base-content/60 uppercase tracking-wide">Tipo</p>
              <p class="font-semibold">{{ event?.type }}</p>
            </div>
          </div>

          <!-- Local -->
          <div class="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg">
            <div class="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-xl">
              📍
            </div>
            <div>
              <p class="text-xs text-base-content/60 uppercase tracking-wide">Local</p>
              <p class="font-semibold">{{ event?.location }}</p>
            </div>
          </div>

          <!-- Responsável -->
          <div class="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg">
            <div v-if="event?.owner_id && getAvatarByUserId(event.owner_id)"
              class="w-10 h-10 rounded-full overflow-hidden">
              <img :src="getAvatarByUserId(event.owner_id)" :alt="getUserName(event.owner_id)"
                class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-xl">
              {{ event?.owner_id ? getUserName(event.owner_id).charAt(0).toUpperCase() : '👤' }}
            </div>
            <div>
              <p class="text-xs text-base-content/60 uppercase tracking-wide">Responsável</p>
              <p class="font-semibold">{{ event?.owner_id ? getUserName(event.owner_id) : 'Não atribuído' }}</p>
            </div>
          </div>

          <!-- Período -->
          <div class="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg">
            <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-xl">
              📅
            </div>
            <div>
              <p class="text-xs text-base-content/60 uppercase tracking-wide">Período</p>
              <p class="font-semibold text-sm">{{ formatDateTime(event?.start_date) }}</p>
              <p class="text-xs text-base-content/60">até {{ formatDateTime(event?.end_date) }}</p>
            </div>
          </div>
        </div>

        <!-- Descrição em destaque -->
        <div v-if="event?.description" class="mt-4 p-4 bg-base-200/30 rounded-lg border-l-4 border-primary">
          <p class="text-xs text-base-content/60 uppercase tracking-wide mb-2">📝 Descrição</p>
          <p class="text-base leading-relaxed">{{ event.description }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs for Reservations, Withdrawals and Returns -->
    <div class="card bg-base-100 shadow-xl w-full">
      <div class="card-body">
        <div class="tabs tabs-boxed mb-4">
          <a @click="activeTab = 'reserved'" :class="['tab', activeTab === 'reserved' ? 'tab-active' : '']">
            📋 Reservados ({{ eventReservations.length }})
          </a>
          <a @click="activeTab = 'tree'" :class="['tab', activeTab === 'tree' ? 'tab-active' : '']">
            🌳 Visão em Árvore
          </a>
          <a @click="activeTab = 'withdrawals'" :class="['tab', activeTab === 'withdrawals' ? 'tab-active' : '']">
            ⬆️ Retiradas ({{ withdrawals.length }})
          </a>
          <a @click="activeTab = 'returns'" :class="['tab', activeTab === 'returns' ? 'tab-active' : '']">
            ⬇️ Devoluções ({{ returns.length }})
          </a>
        </div>

        <!-- Reserved Tab -->
        <div v-if="activeTab === 'reserved'" class="space-y-6">
          <!-- Sub-tabs for Equipment and Bags -->
          <div class="tabs tabs-sm mb-4">
            <a @click="reservedSubTab = 'equipment'"
              :class="['tab tab-bordered', reservedSubTab === 'equipment' ? 'tab-active' : '']">
              🎤 Equipamentos ({{ reservedEquipment.length }})
            </a>
            <a @click="reservedSubTab = 'bags'"
              :class="['tab tab-bordered', reservedSubTab === 'bags' ? 'tab-active' : '']">
              📦 Bags ({{ reservedBags.length }})
            </a>
          </div>

          <!-- Reserved Equipment -->
          <div v-if="reservedSubTab === 'equipment'" class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Equipamento</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Reservado por</th>
                  <th>Período</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reservation in reservedEquipment" :key="reservation.id">
                  <td class="font-mono font-bold">{{ getEquipmentCode(reservation.equipment_id) }}</td>
                  <td>{{ getEquipmentName(reservation.equipment_id) }}</td>
                  <td>
                    <span class="badge badge-outline">{{ getEquipmentCategory(reservation.equipment_id) }}</span>
                  </td>
                  <td>
                    <div class="badge badge-sm" :class="getEquipmentStatusClass(reservation.equipment_id)">
                      {{ getEquipmentStatusText(reservation.equipment_id) }}
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <div class="avatar" :class="{ 'placeholder': !getAvatarByUserId(reservation.reserved_by) }">
                        <div class="bg-neutral text-neutral-content rounded-full w-6 overflow-hidden">
                          <img v-if="getAvatarByUserId(reservation.reserved_by)"
                            :src="getAvatarByUserId(reservation.reserved_by)"
                            :alt="getUserName(reservation.reserved_by)" class="w-full h-full object-cover" />
                          <span v-else class="text-xs">{{ getUserName(reservation.reserved_by).charAt(0).toUpperCase()
                          }}</span>
                        </div>
                      </div>
                      <span class="text-sm">{{ getUserName(reservation.reserved_by) }}</span>
                    </div>
                  </td>
                  <td class="text-sm">
                    <div>{{ formatDateTime(reservation.start_date) }}</div>
                    <div class="text-xs text-base-content/60">até {{ formatDateTime(reservation.end_date) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="reservedEquipment.length === 0" class="text-center py-8 text-base-content/60">
              Nenhum equipamento reservado para este evento
            </div>
          </div>

          <!-- Reserved Bags -->
          <div v-if="reservedSubTab === 'bags'" class="space-y-3">
            <div v-for="reservation in reservedBags" :key="reservation.id"
              class="collapse collapse-arrow bg-base-200 rounded-lg">
              <input type="checkbox" />
              <div class="collapse-title py-3">
                <div class="flex items-center justify-between gap-4 w-full pr-6">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="text-2xl">📦</span>
                    <span class="font-bold text-lg truncate">{{ getBagName(reservation.bag_id) }}</span>
                    <span class="text-sm text-base-content/60 font-mono">({{ getBagCode(reservation.bag_id) }})</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <div class="badge badge-info gap-1">🎤 {{ getBagEquipmentCount(reservation.bag_id) }}</div>
                    <div class="badge badge-sm" :class="getBagStatusClass(reservation.bag_id)">
                      {{ getBagStatusText(reservation.bag_id) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="collapse-content">
                <div class="px-2 pb-2">
                  <div class="flex items-center gap-2 mb-3 text-sm text-base-content/70">
                    <span>Reservado por:</span>
                    <div class="flex items-center gap-2">
                      <div class="avatar" :class="{ 'placeholder': !getAvatarByUserId(reservation.reserved_by) }">
                        <div class="bg-neutral text-neutral-content rounded-full w-5 overflow-hidden">
                          <img v-if="getAvatarByUserId(reservation.reserved_by)"
                            :src="getAvatarByUserId(reservation.reserved_by)"
                            :alt="getUserName(reservation.reserved_by)" class="w-full h-full object-cover" />
                          <span v-else class="text-xs">{{ getUserName(reservation.reserved_by).charAt(0).toUpperCase()
                          }}</span>
                        </div>
                      </div>
                      <span>{{ getUserName(reservation.reserved_by) }}</span>
                    </div>
                    <span class="mx-2">|</span>
                    <span>{{ formatDateTime(reservation.start_date) }} até {{ formatDateTime(reservation.end_date)
                    }}</span>
                  </div>
                </div>
                <table class="table table-sm w-full">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Equipamento</th>
                      <th>Categoria</th>
                      <th class="text-center">Status</th>
                      <th class="text-center">Condição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="equip in getBagEquipment(reservation.bag_id)" :key="equip.id">
                      <td class="font-mono">{{ equip.code }}</td>
                      <td>{{ equip.name }}</td>
                      <td>
                        <span class="badge badge-outline badge-sm">{{ equip.category }}</span>
                      </td>
                      <td class="text-center">
                        <span class="badge badge-sm" :class="getStatusClassDirect(equip.status)">{{
                          getStatusTextDirect(equip.status) }}</span>
                      </td>
                      <td class="text-center">
                        <span class="badge badge-sm" :class="getConditionClass(equip.condition)">{{
                          getConditionText(equip.condition) }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-if="reservedBags.length === 0" class="text-center py-8 text-base-content/60">
              Nenhuma bag reservada para este evento
            </div>
          </div>
        </div>

        <!-- Tree View -->
        <div v-if="activeTab === 'tree'" class="space-y-3">
          <!-- Bags com equipamentos -->
          <div v-for="bag in bagsTree" :key="bag.id" class="collapse collapse-arrow bg-base-200 rounded-lg">
            <input type="checkbox" />
            <div class="collapse-title py-3">
              <div class="flex items-center justify-between gap-4 w-full pr-6">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="text-2xl">📦</span>
                  <span class="font-bold text-lg truncate">{{ bag.name }}</span>
                  <span class="text-sm text-base-content/60 font-mono">({{ bag.code }})</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <div class="badge badge-info gap-1">🎤 {{ bag.equipmentCount }}</div>
                  <div class="badge badge-warning gap-1">⬆️ {{ bag.withdrawals }}</div>
                  <div class="badge badge-success gap-1">⬇️ {{ bag.returns }}</div>
                  <div class="badge gap-1" :class="bag.pending > 0 ? 'badge-error' : 'badge-ghost'">⏳ {{ bag.pending }}
                  </div>
                </div>
              </div>
            </div>
            <div class="collapse-content">
              <table class="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Equipamento</th>
                    <th>Categoria</th>
                    <th class="text-center">Status</th>
                    <th class="text-center">Retiradas</th>
                    <th class="text-center">Devoluções</th>
                    <th class="text-center">Pendente</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="equip in bag.equipmentList" :key="equip.id">
                    <td class="font-mono">{{ equip.code || '-' }}</td>
                    <td>{{ equip.name || 'Equipamento não encontrado' }}</td>
                    <td>
                      <span class="badge badge-outline badge-sm">{{ equip.category || '-' }}</span>
                    </td>
                    <td class="text-center">
                      <span class="badge badge-sm" :class="getStatusClassDirect(equip.status)">{{
                        getStatusTextDirect(equip.status) }}</span>
                    </td>
                    <td class="text-center"><span class="badge badge-warning badge-sm">{{ equip.withdrawals }}</span>
                    </td>
                    <td class="text-center"><span class="badge badge-success badge-sm">{{ equip.returns }}</span></td>
                    <td class="text-center"><span class="badge badge-sm"
                        :class="equip.pending > 0 ? 'badge-error' : 'badge-ghost'">{{ equip.pending }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Equipamentos individuais (sem bag) -->
          <div v-for="equipment in individualEquipmentTree" :key="equipment.id" class="bg-base-200 rounded-lg p-4">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-2xl">🎤</span>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-lg truncate">{{ equipment.name || 'Equipamento não encontrado' }}</span>
                    <span class="text-sm text-base-content/60 font-mono">({{ equipment.code || '-' }})</span>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="badge badge-outline badge-sm">{{ equipment.category || '-' }}</span>
                    <span class="badge badge-sm" :class="getStatusClassDirect(equipment.status)">{{
                      getStatusTextDirect(equipment.status) }}</span>
                  </div>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 ml-16">
                <div class="badge badge-warning gap-1">⬆️ {{ equipment.withdrawals }}</div>
                <div class="badge badge-success gap-1">⬇️ {{ equipment.returns }}</div>
                <div class="badge gap-1" :class="equipment.pending > 0 ? 'badge-error' : 'badge-ghost'">⏳ {{
                  equipment.pending }}</div>
              </div>
            </div>
          </div>

          <div v-if="bagsTree.length === 0 && individualEquipmentTree.length === 0"
            class="text-center py-8 text-base-content/60">
            Nenhum equipamento associado a este evento
          </div>
        </div>

        <!-- Withdrawals Tab -->
        <div v-if="activeTab === 'withdrawals'" class="overflow-x-auto">
          <div class="collapse collapse-arrow bg-base-200 mb-4">
            <input type="checkbox" />
            <div class="collapse-title flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  class="h-5 w-5">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M6 10h12M10 16h4" />
                </svg>
                <span class="font-medium">Filtros de busca</span>
              </div>
              <div class="text-sm text-base-content/60">
                Mostrando {{ filteredWithdrawals.length }} de {{ withdrawals.length }}
              </div>
            </div>
            <div class="collapse-content">
              <div class="flex flex-wrap gap-3 items-end">
                <FormInput v-model="withdrawalFilters.query" label="Buscar"
                  placeholder="Equipamento, bag, usuário ou observação" />

              </div>
            </div>
          </div>
          <table class="table table-zebra">
            <thead>
              <tr>
                <th></th>
                <th>Data</th>
                <th>Item</th>
                <th>Usuário</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              <!-- Bags agrupadas -->
              <template v-for="bagGroup in groupedWithdrawals.bags" :key="bagGroup.bagId">
                <tr :class="{ 'bg-base-200/50': expandedWithdrawalBags.includes(bagGroup.bagId) }"
                  v-for="transaction in bagGroup.transactions" :key="`w-${bagGroup.bagId}-${transaction.id}`">
                  <td class="w-10">
                    <button @click="toggleWithdrawalBagExpansion(bagGroup.bagId)"
                      class="btn btn-xs btn-circle btn-ghost text-lg font-bold">
                      {{ expandedWithdrawalBags.includes(bagGroup.bagId) ? '−' : '+' }}
                    </button>
                  </td>
                  <td>{{ formatDateTime(bagGroup.latestDate) }}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="text-lg">📦</span>
                      <div>
                        <div class="font-mono font-bold text-primary">{{ bagGroup.bagCode }}</div>
                        <div class="text-sm text-base-content/70">{{ bagGroup.bagName }}</div>
                        <div class="text-xs text-base-content/50">{{ bagGroup.transactions.length }} retiradas de {{
                          bagGroup.equipmentCount }} equipamentos</div>
                      </div>
                    </div>
                  </td>
                  <td class="w-text-sm">
                    <div class="flex items-center gap-2">
                      <div class="avatar"
                        :class="{ 'placeholder': !getAvatarByUserId(getTransactionUser(transaction)?.id) }">
                        <div class="bg-neutral text-neutral-content rounded-full w-6 overflow-hidden">
                          <img v-if="getAvatarByUserId(getTransactionUser(transaction)?.id)"
                            :src="getAvatarByUserId(getTransactionUser(transaction)?.id)"
                            :alt="getTransactionUser(transaction)?.username || getUserName(transaction.user_id)"
                            class="w-full h-full object-cover" />
                          <span v-else class="text-xs">{{ (getTransactionUser(transaction)?.username ||
                            getUserName(transaction.user_id)).charAt(0).toUpperCase() }}</span>
                        </div>
                      </div>
                      <span>{{ getTransactionUser(transaction)?.username || getUserName(transaction.user_id) }}</span>
                    </div>
                  </td>
                  <td class="text-sm">{{ transaction.notes || '-' }}</td>
                </tr>
                <!-- Equipamentos expandidos da bag -->
                <template v-if="expandedWithdrawalBags.includes(bagGroup.bagId)">
                  <tr v-for="row in getBagExpandedRows(bagGroup, 'withdrawal')" :key="`w-${bagGroup.bagId}-${row.key}`"
                    class="bg-base-200/30">
                    <td></td>
                    <td>
                      <span class="text-base-content/40">└─</span>
                      {{ formatDateTime(row.date) }}
                    </td>
                    <td>
                      <div class="flex items-center gap-2 pl-4">
                        <span class="text-sm">🎤</span>
                        <div>
                          <div class="font-mono text-sm">{{ getEquipmentCode(row.equipmentId) }}</div>
                          <div class="text-xs text-base-content/70">{{ getEquipmentName(row.equipmentId) }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="text-sm">
                      <div class="flex items-center gap-2">
                        <div class="avatar"
                          :class="{ 'placeholder': !getAvatarByUserId(getTransactionUser(row.transaction)?.id) }">
                          <div class="bg-neutral text-neutral-content rounded-full w-6 overflow-hidden">
                            <img v-if="getAvatarByUserId(getTransactionUser(row.transaction)?.id)"
                              :src="getAvatarByUserId(getTransactionUser(row.transaction)?.id)"
                              :alt="getTransactionUser(row.transaction)?.username || getUserName(row.transaction?.user_id)"
                              class="w-full h-full object-cover" />
                            <span v-else class="text-xs">{{ (getTransactionUser(row.transaction)?.username ||
                              getUserName(row.transaction?.user_id)).charAt(0).toUpperCase() }}</span>
                          </div>
                        </div>
                        <span>{{ getTransactionUser(row.transaction)?.username || getUserName(row.transaction?.user_id)
                          }}</span>
                      </div>
                    </td>
                    <td class="text-sm">{{ row.transaction?.notes || '-' }}</td>
                  </tr>
                </template>
              </template>
              <!-- Equipamentos individuais (sem bag) -->
              <tr v-for="transaction in groupedWithdrawals.individual" :key="transaction.id">
                <td class="w-10"></td>
                <td>{{ formatDateTime(transaction.scheduled_date || transaction.created_at) }}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🎤</span>
                    <div>
                      <div class="font-mono font-bold">{{ getEquipmentCode(transaction.equipment_id) }}</div>
                      <div class="text-sm text-base-content/70">{{ getEquipmentName(transaction.equipment_id) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar"
                      :class="{ 'placeholder': !getAvatarByUserId(getTransactionUser(transaction)?.id) }">
                      <div class="bg-neutral text-neutral-content rounded-full w-6 overflow-hidden">
                        <img v-if="getAvatarByUserId(getTransactionUser(transaction)?.id)"
                          :src="getAvatarByUserId(getTransactionUser(transaction)?.id)"
                          :alt="getTransactionUser(transaction)?.username || getUserName(transaction.user_id)"
                          class="w-full h-full object-cover" />
                        <span v-else class="text-xs">{{ (getTransactionUser(transaction)?.username ||
                          getUserName(transaction.user_id)).charAt(0).toUpperCase() }}</span>
                      </div>
                    </div>
                    <span>{{ getTransactionUser(transaction)?.username || getUserName(transaction.user_id) }}</span>
                  </div>
                </td>
                <td>{{ transaction.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="groupedWithdrawals.bags.length === 0 && groupedWithdrawals.individual.length === 0"
            class="text-center py-8 text-base-content/60">
            Nenhuma retirada registrada para este evento
          </div>
        </div>

        <!-- Returns Tab -->
        <div v-if="activeTab === 'returns'" class="overflow-x-auto">
          <div class="collapse collapse-arrow bg-base-200 mb-4">
            <input type="checkbox" />
            <div class="collapse-title flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  class="h-5 w-5">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M6 10h12M10 16h4" />
                </svg>
                <span class="font-medium">Filtros de busca</span>
              </div>
              <div class="text-sm text-base-content/60">
                Mostrando {{ filteredReturns.length }} de {{ returns.length }}
              </div>
            </div>
            <div class="collapse-content">
              <div class="flex flex-wrap gap-3 items-end">
                <FormInput v-model="returnFilters.query" label="Buscar"
                  placeholder="Equipamento, usuário ou observação" />
                <FormSelect v-model="returnFilters.status" label="Status" :options="returnStatusOptions" />

              </div>
            </div>
          </div>
          <table class="table table-zebra">
            <thead>
              <tr>
                <th></th>
                <th>Data</th>
                <th>Item</th>
                <th>Usuário</th>
                <th>Status</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              <!-- Bags agrupadas -->
              <template v-for="bagGroup in groupedReturns.bags" :key="bagGroup.bagId">
                <tr :class="{ 'bg-base-200/50': expandedReturnBags.includes(bagGroup.bagId) }"
                  v-for="transaction in bagGroup.transactions" :key="`r-${bagGroup.bagId}-${transaction.id}`">
                  <td class="w-10">
                    <button @click="toggleReturnBagExpansion(bagGroup.bagId)"
                      class="btn btn-xs btn-circle btn-ghost text-lg font-bold">
                      {{ expandedReturnBags.includes(bagGroup.bagId) ? '−' : '+' }}
                    </button>
                  </td>
                  <td>{{ formatDateTime(bagGroup.latestDate) }}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="text-lg">📦</span>
                      <div>
                        <div class="font-mono font-bold text-primary">{{ bagGroup.bagCode }}</div>
                        <div class="text-sm text-base-content/70">{{ bagGroup.bagName }}</div>
                        <div class="text-xs text-base-content/50">{{ bagGroup.transactions.length }} devoluções de {{
                          bagGroup.equipmentCount }} equipamentos</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-sm">
                    <div class="flex items-center gap-2">
                      <div class="avatar"
                        :class="{ 'placeholder': !getAvatarByUserId(getTransactionUser(transaction)?.id) }">
                        <div class="bg-neutral text-neutral-content rounded-full w-6 overflow-hidden">
                          <img v-if="getAvatarByUserId(getTransactionUser(transaction)?.id)"
                            :src="getAvatarByUserId(getTransactionUser(transaction)?.id)"
                            :alt="getTransactionUser(transaction)?.username || getUserName(transaction.user_id)"
                            class="w-full h-full object-cover" />
                          <span v-else class="text-xs">{{ (getTransactionUser(transaction)?.username ||
                            getUserName(transaction.user_id)).charAt(0).toUpperCase() }}</span>
                        </div>
                      </div>
                      <span>{{ getTransactionUser(transaction)?.username || getUserName(transaction.user_id) }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="badge badge-sm" :class="getReturnStatusClass(transaction.status)">
                      {{ getReturnStatusText(transaction.status) }}
                    </div>
                  </td>
                  <td class="text-sm">{{ transaction.notes || '-' }}</td>
                </tr>
                <!-- Equipamentos expandidos da bag -->
                <template v-if="expandedReturnBags.includes(bagGroup.bagId)">
                  <tr v-for="row in getBagExpandedRows(bagGroup, 'return')" :key="`r-${bagGroup.bagId}-${row.key}`"
                    class="bg-base-200/30">
                    <td></td>
                    <td>
                      <span class="text-base-content/40">└─</span>
                      {{ formatDateTime(row.date) }}
                    </td>
                    <td>
                      <div class="flex items-center gap-2 pl-4">
                        <span class="text-sm">🎤</span>
                        <div>
                          <div class="font-mono text-sm">{{ getEquipmentCode(row.equipmentId) }}</div>
                          <div class="text-xs text-base-content/70">{{ getEquipmentName(row.equipmentId) }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="text-sm">
                      <div class="flex items-center gap-2">
                        <div class="avatar"
                          :class="{ 'placeholder': !getAvatarByUserId(getTransactionUser(row.transaction)?.id) }">
                          <div class="bg-neutral text-neutral-content rounded-full w-6 overflow-hidden">
                            <img v-if="getAvatarByUserId(getTransactionUser(row.transaction)?.id)"
                              :src="getAvatarByUserId(getTransactionUser(row.transaction)?.id)"
                              :alt="getTransactionUser(row.transaction)?.username || getUserName(row.transaction?.user_id)"
                              class="w-full h-full object-cover" />
                            <span v-else class="text-xs">{{ (getTransactionUser(row.transaction)?.username ||
                              getUserName(row.transaction?.user_id)).charAt(0).toUpperCase() }}</span>
                          </div>
                        </div>
                        <span>{{ getTransactionUser(row.transaction)?.username || getUserName(row.transaction?.user_id)
                          }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="badge badge-sm" :class="getReturnStatusClass(row.transaction?.status)">
                        {{ getReturnStatusText(row.transaction?.status) }}
                      </div>
                    </td>
                    <td class="text-sm">{{ row.transaction?.notes || '-' }}</td>
                  </tr>
                </template>
              </template>
              <!-- Equipamentos individuais (sem bag) -->
              <tr v-for="transaction in groupedReturns.individual" :key="transaction.id">
                <td class="w-10"></td>
                <td>{{ formatDateTime(transaction.actual_date || transaction.created_at) }}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🎤</span>
                    <div>
                      <div class="font-mono font-bold">{{ getEquipmentCode(transaction.equipment_id) }}</div>
                      <div class="text-sm text-base-content/70">{{ getEquipmentName(transaction.equipment_id) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar"
                      :class="{ 'placeholder': !getAvatarByUserId(getTransactionUser(transaction)?.id) }">
                      <div class="bg-neutral text-neutral-content rounded-full w-6 overflow-hidden">
                        <img v-if="getAvatarByUserId(getTransactionUser(transaction)?.id)"
                          :src="getAvatarByUserId(getTransactionUser(transaction)?.id)"
                          :alt="getTransactionUser(transaction)?.username || getUserName(transaction.user_id)"
                          class="w-full h-full object-cover" />
                        <span v-else class="text-xs">{{ (getTransactionUser(transaction)?.username ||
                          getUserName(transaction.user_id)).charAt(0).toUpperCase() }}</span>
                      </div>
                    </div>
                    <span>{{ getTransactionUser(transaction)?.username || getUserName(transaction.user_id) }}</span>
                  </div>
                </td>
                <td>
                  <div class="badge" :class="getReturnStatusClass(transaction.status)">
                    {{ getReturnStatusText(transaction.status) }}
                  </div>
                </td>
                <td>{{ transaction.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="groupedReturns.bags.length === 0 && groupedReturns.individual.length === 0"
            class="text-center py-8 text-base-content/60">
            Nenhuma devolução registrada para este evento
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="stat bg-base-100 shadow-xl rounded-lg">
        <div class="stat-title">📋 Reservados</div>
        <div class="stat-value text-info">{{ eventReservations.length }}</div>
        <div class="stat-desc">{{ reservedEquipment.length }} equip. | {{ reservedBags.length }} bags</div>
      </div>
      <div class="stat bg-base-100 shadow-xl rounded-lg">
        <div class="stat-title">⬆️ Retiradas</div>
        <div class="stat-value text-warning">{{ withdrawals.length }}</div>
      </div>
      <div class="stat bg-base-100 shadow-xl rounded-lg">
        <div class="stat-title">⬇️ Devoluções</div>
        <div class="stat-value text-success">{{ returns.length }}</div>
      </div>
      <div class="stat bg-base-100 shadow-xl rounded-lg">
        <div class="stat-title">⏳ Pendentes</div>
        <div class="stat-value text-error">{{ Math.max(0, withdrawals.length - returns.length) }}</div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Modal id="event-edit-modal" v-model="showEditModal" title="Editar Evento">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <FormInput v-model="eventForm.code" label="Código" required />
          <FormInput v-model="eventForm.name" label="Nome do Evento" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <FormInput v-model="eventForm.type" label="Tipo" required />
          <FormInput v-model="eventForm.category" label="Categoria" />
        </div>
        <FormInput v-model="eventForm.location" label="Local" />

        <FormSelect v-model="eventForm.status" label="Status" :options="statusOptions" required />

        <div class="grid grid-cols-2 gap-4">
          <FormInput v-model="eventForm.start_date" label="Data de Início" type="datetime-local" required />
          <FormInput v-model="eventForm.end_date" label="Data de Término" type="datetime-local" required />
        </div>

        <FormTextarea v-model="eventForm.description" label="Descrição" :rows="4" />
      </div>

      <template #actions>
        <button @click="showEditModal = false" class="btn btn-ghost">Cancelar</button>
        <button @click="saveEvent" class="btn btn-primary">Salvar</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import type { Event, EventStatus, TransactionStatus, Transaction } from '~/types'
import { formatDateTimeBR } from "~/utils/dateUtils";
import { useUserAvatar } from "~/composables/useUserAvatar";

definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { getAvatarByUserId } = useUserAvatar()

const eventId = computed(() => route.params.id as string)
const event = ref<Event | null>(null)
const activeTab = ref<'reserved' | 'tree' | 'withdrawals' | 'returns'>('reserved')
const reservedSubTab = ref<'equipment' | 'bags'>('equipment')
const showEditModal = ref(false)

const goBack = () => {
  router.push('/events')
}

const eventForm = ref({
  code: '',
  name: '',
  location: '',
  type: '',
  category: '',
  status: 'planned' as EventStatus,
  start_date: '',
  end_date: '',
  description: ''
})

const statusOptions = [
  { value: 'planned', label: 'Planejado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' }
]

const returnStatusOptions = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' }
]

// Carregar dados
onMounted(async () => {
  await Promise.all([
    appStore.fetchEvents(),
    appStore.fetchTransactions(),
    appStore.fetchEquipment(),
    appStore.fetchUsers(),
    appStore.fetchBags(),
    appStore.fetchReservations()
  ])

  // Buscar evento pelo ID
  event.value = appStore.events.find(e => e.id === eventId.value) || null

  if (event.value) {
    eventForm.value = {
      code: event.value.code || '',
      name: event.value.name || '',
      location: event.value.location || '',
      type: event.value.type || '',
      category: event.value.category || '',
      status: event.value.status || 'planned',
      start_date: formatForInput(event.value.start_date),
      end_date: formatForInput(event.value.end_date),
      description: event.value.description || ''
    }
  }
})

// Computed para reservas do evento
const eventReservations = computed(() => {
  return appStore.reservations.filter(r =>
    r.event_id === eventId.value && r.status === 'active'
  )
})

const reservedEquipment = computed(() => {
  return eventReservations.value.filter(r => r.equipment_id && !r.bag_id)
})

const reservedBags = computed(() => {
  return eventReservations.value.filter(r => r.bag_id)
})

// Computed para transações de retirada e devolução
const withdrawals = computed(() => {
  return appStore.transactions.filter(t =>
    (t.event_id === eventId.value) &&
    t.transaction_type?.toUpperCase() === 'WITHDRAWAL'
  )
})

const returns = computed(() => {
  return appStore.transactions.filter(t =>
    (t.event_id === eventId.value) &&
    t.transaction_type?.toUpperCase() === 'RETURN'
  )
})

const withdrawalFilters = ref({
  query: '',
  from: '',
  to: ''
})

const returnFilters = ref({
  query: '',
  status: '',
  from: '',
  to: ''
})

// Estados de expansão para bags
const expandedWithdrawalBags = ref<string[]>([])
const expandedReturnBags = ref<string[]>([])

const toggleWithdrawalBagExpansion = (transactionId: string) => {
  const index = expandedWithdrawalBags.value.indexOf(transactionId)
  if (index === -1) {
    expandedWithdrawalBags.value.push(transactionId)
  } else {
    expandedWithdrawalBags.value.splice(index, 1)
  }
}

const toggleReturnBagExpansion = (transactionId: string) => {
  const index = expandedReturnBags.value.indexOf(transactionId)
  if (index === -1) {
    expandedReturnBags.value.push(transactionId)
  } else {
    expandedReturnBags.value.splice(index, 1)
  }
}

// Agrupar retiradas por bag
const groupedWithdrawals = computed(() => {
  const bagMap = new Map<string, {
    bagId: string,
    bagName: string,
    bagCode: string,
    equipmentCount: number,
    transactions: typeof withdrawals.value,
    latestDate: string
  }>()
  const individual: typeof withdrawals.value = []

  filteredWithdrawals.value.forEach(t => {
    // Se o equipamento pertence a uma bag, agrupar
    if (t.equipment_id) {
      const equipment = appStore.getEquipmentById(t.equipment_id)
      if (equipment?.bag_id) {
        const bag = appStore.getBagById(equipment.bag_id)
        if (!bagMap.has(equipment.bag_id)) {
          bagMap.set(equipment.bag_id, {
            bagId: equipment.bag_id,
            bagName: bag?.name || 'Bag Desconhecida',
            bagCode: bag?.code || '',
            equipmentCount: appStore.equipment.filter(e => e.bag_id === equipment.bag_id).length,
            transactions: [],
            latestDate: t.scheduled_date || t.created_at || ''
          })
        }
        const bagGroup = bagMap.get(equipment.bag_id)!
        bagGroup.transactions.push(t)
        if ((t.scheduled_date || t.created_at || '') > bagGroup.latestDate) {
          bagGroup.latestDate = t.scheduled_date || t.created_at || ''
        }
      } else {
        individual.push(t)
      }
    } else if (t.bag_id) {
      // Transação direta de bag
      const bag = appStore.getBagById(t.bag_id)
      if (!bagMap.has(t.bag_id)) {
        bagMap.set(t.bag_id, {
          bagId: t.bag_id,
          bagName: bag?.name || 'Bag Desconhecida',
          bagCode: bag?.code || '',
          equipmentCount: appStore.equipment.filter(e => e.bag_id === t.bag_id).length,
          transactions: [],
          latestDate: t.scheduled_date || t.created_at || ''
        })
      }
      const bagGroup = bagMap.get(t.bag_id)!
      bagGroup.transactions.push(t)
    } else {
      individual.push(t)
    }
  })

  return {
    bags: Array.from(bagMap.values()).sort((a, b) => b.latestDate.localeCompare(a.latestDate)),
    individual: individual.sort((a, b) => (b.scheduled_date || b.created_at || '').localeCompare(a.scheduled_date || a.created_at || ''))
  }
})

// Agrupar devoluções por bag
const groupedReturns = computed(() => {
  const bagMap = new Map<string, {
    bagId: string,
    bagName: string,
    bagCode: string,
    equipmentCount: number,
    transactions: typeof returns.value,
    latestDate: string
  }>()
  const individual: typeof returns.value = []

  filteredReturns.value.forEach(t => {
    // Se o equipamento pertence a uma bag, agrupar
    if (t.equipment_id) {
      const equipment = appStore.getEquipmentById(t.equipment_id)
      if (equipment?.bag_id) {
        const bag = appStore.getBagById(equipment.bag_id)
        if (!bagMap.has(equipment.bag_id)) {
          bagMap.set(equipment.bag_id, {
            bagId: equipment.bag_id,
            bagName: bag?.name || 'Bag Desconhecida',
            bagCode: bag?.code || '',
            equipmentCount: appStore.equipment.filter(e => e.bag_id === equipment.bag_id).length,
            transactions: [],
            latestDate: t.actual_date || t.created_at || ''
          })
        }
        const bagGroup = bagMap.get(equipment.bag_id)!
        bagGroup.transactions.push(t)
        if ((t.actual_date || t.created_at || '') > bagGroup.latestDate) {
          bagGroup.latestDate = t.actual_date || t.created_at || ''
        }
      } else {
        individual.push(t)
      }
    } else if (t.bag_id) {
      // Transação direta de bag
      const bag = appStore.getBagById(t.bag_id)
      if (!bagMap.has(t.bag_id)) {
        bagMap.set(t.bag_id, {
          bagId: t.bag_id,
          bagName: bag?.name || 'Bag Desconhecida',
          bagCode: bag?.code || '',
          equipmentCount: appStore.equipment.filter(e => e.bag_id === t.bag_id).length,
          transactions: [],
          latestDate: t.actual_date || t.created_at || ''
        })
      }
      const bagGroup = bagMap.get(t.bag_id)!
      bagGroup.transactions.push(t)
    } else {
      individual.push(t)
    }
  })

  return {
    bags: Array.from(bagMap.values()).sort((a, b) => b.latestDate.localeCompare(a.latestDate)),
    individual: individual.sort((a, b) => (b.actual_date || b.created_at || '').localeCompare(a.actual_date || a.created_at || ''))
  }
})

// Funções para bags
const getBagCode = (bagId: string | undefined) => {
  if (!bagId) return '-'
  return appStore.bags.find(b => b.id === bagId)?.code || '-'
}

const getBagName = (bagId: string | undefined) => {
  if (!bagId) return 'Desconhecida'
  return appStore.bags.find(b => b.id === bagId)?.name || 'Desconhecida'
}

const getBagEquipmentCount = (bagId: string | undefined) => {
  if (!bagId) return 0
  return appStore.equipment.filter(e => e.bag_id === bagId).length
}

const getBagEquipment = (bagId: string | undefined) => {
  if (!bagId) return []
  return appStore.equipment.filter(e => e.bag_id === bagId)
}

const getBagExpandedRows = (
  bagGroup: { bagId: string; transactions: Transaction[]; latestDate: string },
  mode: 'withdrawal' | 'return'
) => {
  const equipmentTransactions = bagGroup.transactions.filter(t => t.equipment_id)
  if (equipmentTransactions.length > 0) {
    return equipmentTransactions.map(t => ({
      key: t.id,
      equipmentId: t.equipment_id as string,
      date: mode === 'return'
        ? (t.actual_date || t.created_at || bagGroup.latestDate)
        : (t.scheduled_date || t.created_at || bagGroup.latestDate),
      transaction: t
    }))
  }

  const fallbackTransaction = bagGroup.transactions[0]
  const fallbackDate = mode === 'return'
    ? (fallbackTransaction?.actual_date || fallbackTransaction?.created_at || bagGroup.latestDate)
    : (fallbackTransaction?.scheduled_date || fallbackTransaction?.created_at || bagGroup.latestDate)

  return getBagEquipment(bagGroup.bagId).map(e => ({
    key: `${bagGroup.bagId}-${e.id}`,
    equipmentId: e.id,
    date: fallbackDate,
    transaction: fallbackTransaction
  }))
}

const filteredWithdrawals = computed(() => {
  const query = withdrawalFilters.value.query.trim().toLowerCase()
  const from = withdrawalFilters.value.from ? new Date(withdrawalFilters.value.from) : null
  const to = withdrawalFilters.value.to ? new Date(withdrawalFilters.value.to) : null

  return withdrawals.value.filter(item => {
    const dateValue = item.scheduled_date || item.created_at
    const itemDate = dateValue ? new Date(dateValue) : null

    if (from && itemDate && itemDate < from) return false
    if (to && itemDate && itemDate > to) return false

    if (!query) return true

    // Buscar em equipamento
    if (item.equipment_id) {
      const equipmentName = getEquipmentName(item.equipment_id).toLowerCase()
      const equipmentCode = getEquipmentCode(item.equipment_id).toLowerCase()
      if (equipmentName.includes(query) || equipmentCode.includes(query)) return true
    }

    // Buscar em bag
    if (item.bag_id) {
      const bagName = getBagName(item.bag_id).toLowerCase()
      const bagCode = getBagCode(item.bag_id).toLowerCase()
      if (bagName.includes(query) || bagCode.includes(query)) return true
    }

    const userName = getUserName(item.user_id).toLowerCase()
    const notes = (item.notes || '').toLowerCase()
    return userName.includes(query) || notes.includes(query)
  })
})

const filteredReturns = computed(() => {
  const query = returnFilters.value.query.trim().toLowerCase()
  const status = returnFilters.value.status
  const from = returnFilters.value.from ? new Date(returnFilters.value.from) : null
  const to = returnFilters.value.to ? new Date(returnFilters.value.to) : null

  return returns.value.filter(item => {
    const dateValue = item.actual_date || item.created_at
    const itemDate = dateValue ? new Date(dateValue) : null

    if (from && itemDate && itemDate < from) return false
    if (to && itemDate && itemDate > to) return false
    if (status && item.status !== status) return false

    if (!query) return true

    // Buscar em equipamento
    if (item.equipment_id) {
      const equipmentName = getEquipmentName(item.equipment_id).toLowerCase()
      const equipmentCode = getEquipmentCode(item.equipment_id).toLowerCase()
      if (equipmentName.includes(query) || equipmentCode.includes(query)) return true
    }

    // Buscar em bag
    if (item.bag_id) {
      const bagName = getBagName(item.bag_id).toLowerCase()
      const bagCode = getBagCode(item.bag_id).toLowerCase()
      if (bagName.includes(query) || bagCode.includes(query)) return true
    }

    const userName = getUserName(item.user_id).toLowerCase()
    const notes = (item.notes || '').toLowerCase()
    return userName.includes(query) || notes.includes(query)
  })
})

// Estrutura em árvore agrupada por equipamento
const equipmentTree = computed(() => {
  const equipmentMap = new Map()

  // Agrupar retiradas por equipamento
  withdrawals.value.forEach(withdrawal => {
    const equipId = withdrawal.equipment_id
    if (!equipId) return

    if (!equipmentMap.has(equipId)) {
      const equipment = appStore.getEquipmentById(equipId)
      equipmentMap.set(equipId, {
        id: equipId,
        name: equipment?.name || 'Equipamento não encontrado',
        code: equipment?.code || '-',
        category: equipment?.category || '-',
        status: equipment?.status || 'unknown',
        condition: equipment?.condition || 'unknown',
        bag_id: equipment?.bag_id || null,
        withdrawals: 0,
        returns: 0,
        pending: 0,
        withdrawalsList: [],
        returnsList: []
      })
    }

    const item = equipmentMap.get(equipId)
    item.withdrawals++
    item.withdrawalsList.push(withdrawal)
  })

  // Agrupar devoluções por equipamento
  returns.value.forEach(returnItem => {
    const equipId = returnItem.equipment_id
    if (!equipId) return

    if (!equipmentMap.has(equipId)) {
      const equipment = appStore.getEquipmentById(equipId)
      equipmentMap.set(equipId, {
        id: equipId,
        name: equipment?.name || 'Equipamento não encontrado',
        code: equipment?.code || '-',
        category: equipment?.category || '-',
        status: equipment?.status || 'unknown',
        condition: equipment?.condition || 'unknown',
        bag_id: equipment?.bag_id || null,
        withdrawals: 0,
        returns: 0,
        pending: 0,
        withdrawalsList: [],
        returnsList: []
      })
    }

    const item = equipmentMap.get(equipId)
    item.returns++
    item.returnsList.push(returnItem)
  })

  // Calcular pendentes (nunca pode ser negativo)
  equipmentMap.forEach(item => {
    item.pending = Math.max(0, item.withdrawals - item.returns)
  })

  return Array.from(equipmentMap.values()).sort((a, b) => b.pending - a.pending)
})

// Equipamentos individuais (sem bag)
const individualEquipmentTree = computed(() => {
  return equipmentTree.value.filter(eq => !eq.bag_id)
})

// Bags com seus equipamentos
const bagsTree = computed(() => {
  const bagMap = new Map()

  // Se bags não foram carregadas ainda, retornar vazio
  if (appStore.bags.length === 0) return []

  // 1. Primeiro, processar transações que têm bag_id diretamente (retirada/devolução de bag inteira)
  withdrawals.value.forEach(withdrawal => {
    if (!withdrawal.bag_id) return

    const bagId = withdrawal.bag_id
    if (!bagMap.has(bagId)) {
      const bag = appStore.getBagById(bagId)
      const bagEquipments = appStore.equipment.filter(e => e.bag_id === bagId)
      bagMap.set(bagId, {
        id: bagId,
        name: bag?.name || 'Bag não encontrada',
        code: bag?.code || '-',
        equipmentCount: bagEquipments.length,
        withdrawals: 0,
        returns: 0,
        pending: 0,
        equipmentList: bagEquipments.map(eq => ({
          id: eq.id,
          code: eq.code,
          name: eq.name,
          category: eq.category,
          status: eq.status,
          condition: eq.condition,
          bag_id: eq.bag_id,
          withdrawals: 0,
          returns: 0,
          pending: 0
        }))
      })
    }

    const bagItem = bagMap.get(bagId)
    bagItem.withdrawals++
    // Propagar retirada de bag para cada equipamento da bag (incrementa contagem dos itens expandidos)
    bagItem.equipmentList.forEach((eq: any) => {
      eq.withdrawals += 1
    })
  })

  returns.value.forEach(returnItem => {
    if (!returnItem.bag_id) return

    const bagId = returnItem.bag_id
    if (!bagMap.has(bagId)) {
      const bag = appStore.getBagById(bagId)
      const bagEquipments = appStore.equipment.filter(e => e.bag_id === bagId)
      bagMap.set(bagId, {
        id: bagId,
        name: bag?.name || 'Bag não encontrada',
        code: bag?.code || '-',
        equipmentCount: bagEquipments.length,
        withdrawals: 0,
        returns: 0,
        pending: 0,
        equipmentList: bagEquipments.map(eq => ({
          id: eq.id,
          code: eq.code,
          name: eq.name,
          category: eq.category,
          status: eq.status,
          condition: eq.condition,
          bag_id: eq.bag_id,
          withdrawals: 0,
          returns: 0,
          pending: 0
        }))
      })
    }

    const bagItem = bagMap.get(bagId)
    bagItem.returns++
    // Propagar devolução de bag para cada equipamento da bag (incrementa contagem dos itens expandidos)
    bagItem.equipmentList.forEach((eq: any) => {
      eq.returns += 1
    })
  })

  // 2. Depois, agrupar equipamentos individuais por bag (transações com equipment_id)
  equipmentTree.value.forEach(eq => {
    if (!eq.bag_id) return

    if (!bagMap.has(eq.bag_id)) {
      const bag = appStore.getBagById(eq.bag_id)
      const bagEquipments = appStore.equipment.filter(e => e.bag_id === eq.bag_id)
      bagMap.set(eq.bag_id, {
        id: eq.bag_id,
        name: bag?.name || 'Bag não encontrada',
        code: bag?.code || '-',
        equipmentCount: bagEquipments.length,
        withdrawals: 0,
        returns: 0,
        pending: 0,
        equipmentList: bagEquipments.map(e => ({
          id: e.id,
          code: e.code,
          name: e.name,
          category: e.category,
          status: e.status,
          condition: e.condition,
          bag_id: e.bag_id,
          withdrawals: 0,
          returns: 0,
          pending: 0
        }))
      })
    }

    const bagItem = bagMap.get(eq.bag_id)

    // Verificar se o equipamento já está na lista
    const existingEquip = bagItem.equipmentList.find((e: any) => e.id === eq.id)
    if (existingEquip) {
      existingEquip.withdrawals += eq.withdrawals
      existingEquip.returns += eq.returns
      existingEquip.pending = Math.max(0, existingEquip.withdrawals - existingEquip.returns)
    } else {
      // Buscar dados completos do equipamento do store
      const fullEquip = appStore.getEquipmentById(eq.id)
      bagItem.equipmentCount++
      bagItem.equipmentList.push({
        ...eq,
        category: fullEquip?.category || eq.category || '-',
        status: fullEquip?.status || eq.status || 'unknown',
        condition: fullEquip?.condition || eq.condition || 'unknown'
      })
    }

    bagItem.withdrawals += eq.withdrawals
    bagItem.returns += eq.returns
  })

  // Calcular pendentes para cada bag
  bagMap.forEach(bagItem => {
    bagItem.pending = Math.max(0, bagItem.withdrawals - bagItem.returns)
    // Atualizar pendentes de cada equipamento
    bagItem.equipmentList.forEach((eq: any) => {
      eq.pending = Math.max(0, eq.withdrawals - eq.returns)
    })
  })

  return Array.from(bagMap.values()).sort((a, b) => b.pending - a.pending)
})

// Funções auxiliares
const getUserName = (userId: string | undefined) => {
  if (!userId) return 'Desconhecido'
  const user = appStore.getUserById(userId)
  return user?.username || 'Desconhecido'
}

// Try to resolve user from transaction (prefers nested `user` if present)
const getTransactionUser = (transaction: any) => {
  if (!transaction) return null
  if (transaction.user) return transaction.user
  if (transaction.user_id) return appStore.getUserById(transaction.user_id) || { id: transaction.user_id, username: 'Desconhecido' }
  return null
}

const getEquipmentName = (equipmentId: string | undefined) => {
  if (!equipmentId) return 'Desconhecido'
  const equipment = appStore.getEquipmentById(equipmentId)
  return equipment?.name || 'Desconhecido'
}

const getEquipmentCode = (equipmentId: string | undefined) => {
  if (!equipmentId) return ''
  const equipment = appStore.getEquipmentById(equipmentId)
  return equipment?.code || ''
}

const getEquipmentCategory = (equipmentId: string | undefined) => {
  if (!equipmentId) return '-'
  const equipment = appStore.getEquipmentById(equipmentId)
  return equipment?.category || '-'
}

const getEquipmentStatusClass = (equipmentId: string | undefined) => {
  if (!equipmentId) return 'badge-ghost'
  const equipment = appStore.getEquipmentById(equipmentId)
  return getStatusClassDirect(equipment?.status)
}

const getEquipmentStatusText = (equipmentId: string | undefined) => {
  if (!equipmentId) return 'N/A'
  const equipment = appStore.getEquipmentById(equipmentId)
  return getStatusTextDirect(equipment?.status)
}

const getStatusClassDirect = (status: string | undefined) => {
  const classes: Record<string, string> = {
    available: 'badge-success',
    reserved: 'badge-info',
    in_use: 'badge-warning',
    maintenance: 'badge-error',
    excluded: 'badge-neutral'
  }
  return classes[status || ''] || 'badge-ghost'
}

const getStatusTextDirect = (status: string | undefined) => {
  const texts: Record<string, string> = {
    available: 'Disponível',
    reserved: 'Reservado',
    in_use: 'Em Uso',
    maintenance: 'Manutenção',
    excluded: 'Excluído'
  }
  return texts[status || ''] || 'N/A'
}

const getConditionClass = (condition: string | undefined) => {
  const classes: Record<string, string> = {
    excellent: 'badge-success',
    good: 'badge-info',
    fair: 'badge-warning',
    poor: 'badge-error',
    damaged: 'badge-error'
  }
  return classes[condition || ''] || 'badge-ghost'
}

const getConditionText = (condition: string | undefined) => {
  const texts: Record<string, string> = {
    excellent: 'Excelente',
    good: 'Bom',
    fair: 'Regular',
    poor: 'Ruim',
    damaged: 'Danificado'
  }
  return texts[condition || ''] || 'N/A'
}

const getBagStatusClass = (bagId: string | undefined) => {
  if (!bagId) return 'badge-ghost'
  const bag = appStore.getBagById(bagId)
  const classes: Record<string, string> = {
    available: 'badge-success',
    reserved: 'badge-info',
    in_use: 'badge-warning',
    excluded: 'badge-neutral'
  }
  return classes[bag?.status || ''] || 'badge-ghost'
}

const getBagStatusText = (bagId: string | undefined) => {
  if (!bagId) return 'N/A'
  const bag = appStore.getBagById(bagId)
  const texts: Record<string, string> = {
    available: 'Disponível',
    reserved: 'Reservado',
    in_use: 'Em Uso',
    excluded: 'Excluído'
  }
  return texts[bag?.status || ''] || 'N/A'
}

const formatDateTime = (date: string | undefined) => formatDateTimeBR(date);

const formatForInput = (date: string | undefined) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().slice(0, 16)
}

const getStatusClass = (status: string | undefined) => {
  const classes: Record<string, string> = {
    planned: 'badge-info',
    confirmed: 'badge-success',
    in_progress: 'badge-warning',
    completed: 'badge-neutral',
    cancelled: 'badge-error'
  }
  return classes[status || ''] || 'badge-ghost'
}

const getStatusText = (status: string | undefined) => {
  const texts: Record<string, string> = {
    planned: 'Planejado',
    confirmed: 'Confirmado',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado'
  }
  return texts[status || ''] || status || 'N/A'
}

const getReturnStatusClass = (status: string | undefined) => {
  const classes: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    completed: 'badge-success',
    cancelled: 'badge-error'
  }
  return classes[status || ''] || 'badge-ghost'
}

const getReturnStatusText = (status: string | undefined) => {
  const texts: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado'
  }
  return texts[status || ''] || status || 'N/A'
}

const openEditModal = () => {
  showEditModal.value = true
}

const saveEvent = async () => {
  try {
    await appStore.updateEvent(eventId.value, {
      code: eventForm.value.code,
      name: eventForm.value.name,
      location: eventForm.value.location || undefined,
      type: eventForm.value.type,
      category: eventForm.value.category || undefined,
      status: eventForm.value.status,
      start_date: eventForm.value.start_date,
      end_date: eventForm.value.end_date,
      description: eventForm.value.description || undefined
    })

    // Atualizar dados locais
    event.value = appStore.events.find(e => e.id === eventId.value) || null
    showEditModal.value = false
  } catch (error) {
    console.error('Erro ao salvar evento:', error)
  }
}
</script>

<style scoped>
/* Botão de expansão elegante */
.expand-btn {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 4px;
  border: 1.5px solid hsl(var(--bc) / 0.3);
  background: hsl(var(--b1));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: hsl(var(--b2));
  border-color: hsl(var(--bc) / 0.5);
}

.expand-btn .expand-icon {
  position: relative;
  width: 12px;
  height: 12px;
}

.expand-btn .expand-icon::before,
.expand-btn .expand-icon::after {
  content: '';
  position: absolute;
  background: hsl(var(--bc) / 0.7);
  transition: all 0.2s ease;
  border-radius: 1px;
}

/* Linha horizontal (sempre visível) */
.expand-btn .expand-icon::before {
  width: 12px;
  height: 2px;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

/* Linha vertical (some quando expandido) */
.expand-btn .expand-icon::after {
  width: 2px;
  height: 12px;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
}

/* Quando expandido, a linha vertical some (transforma + em -) */
.expand-btn.expanded .expand-icon::after {
  height: 0;
  top: 50%;
}

.expand-btn.expanded {
  background: hsl(var(--p) / 0.15);
  border-color: hsl(var(--p) / 0.4);
}

.expand-btn.expanded .expand-icon::before,
.expand-btn.expanded .expand-icon::after {
  background: hsl(var(--p));
}
</style>
