/**
 * Composable para gerenciar o avatar do usuário
 * Centraliza a lógica de armazenamento e recuperação do avatar em localStorage
 */
export const useUserAvatar = () => {
  const authStore = useAuthStore();

  // Avatar reativo que é compartilhado entre componentes
  const userAvatar = useState<string | null>("userAvatar", () => null);

  // Chave do localStorage baseada no ID do usuário
  const getStorageKey = () => `user_avatar_${authStore.user?.id}`;

  // Carregar avatar do localStorage
  const loadAvatar = () => {
    if (import.meta.client && authStore.user?.id) {
      const savedAvatar = localStorage.getItem(getStorageKey());
      userAvatar.value = savedAvatar;
    }
  };

  // Salvar avatar no localStorage
  const saveAvatar = (base64: string) => {
    if (import.meta.client && authStore.user?.id) {
      localStorage.setItem(getStorageKey(), base64);
      userAvatar.value = base64;
    }
  };

  // Remover avatar do localStorage
  const removeAvatar = () => {
    if (import.meta.client && authStore.user?.id) {
      localStorage.removeItem(getStorageKey());
      userAvatar.value = null;
    }
  };

  // Processar upload de arquivo
  const processAvatarUpload = (
    file: File,
  ): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      // Validar tipo de arquivo
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        resolve({
          success: false,
          error: "Formato não suportado. Use JPG, PNG ou WebP.",
        });
        return;
      }

      // Validar tamanho (máximo 8MB)
      const maxSize = 8 * 1024 * 1024;
      if (file.size > maxSize) {
        resolve({
          success: false,
          error: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo: 8MB.`,
        });
        return;
      }

      // Ler arquivo como base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;

        // Criar imagem para verificar dimensões e redimensionar se necessário
        const img = new Image();
        img.onload = () => {
          // Redimensionar se muito grande (máx 400x400)
          const maxDimension = 400;
          let { width, height } = img;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          // Criar canvas para redimensionar
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const resizedBase64 = canvas.toDataURL("image/jpeg", 0.8);

            saveAvatar(resizedBase64);
            resolve({ success: true });
          } else {
            resolve({ success: false, error: "Erro ao processar imagem." });
          }
        };
        img.onerror = () => {
          resolve({ success: false, error: "Erro ao carregar imagem." });
        };
        img.src = base64;
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: "Erro ao ler o arquivo. Tente novamente.",
        });
      };

      reader.readAsDataURL(file);
    });
  };

  // Buscar avatar de qualquer usuário pelo ID (para listar usuários)
  const getAvatarByUserId = (
    userId: string | undefined,
  ): string | undefined => {
    if (!userId || !import.meta.client) return undefined;
    return localStorage.getItem(`user_avatar_${userId}`) || undefined;
  };

  // Carregar automaticamente quando o usuário estiver disponível
  // Usar deep watch para evitar perda de avatar ao atualizar perfil
  watch(
    () => authStore.user?.id,
    (newId, oldId) => {
      if (newId) {
        // Só recarrega se o ID realmente mudou (login/logout) ou é primeira vez
        if (newId !== oldId || !userAvatar.value) {
          loadAvatar();
        }
      } else if (!newId && oldId) {
        // Só limpa se realmente fez logout (tinha ID e agora não tem)
        userAvatar.value = null;
      }
    },
    { immediate: true },
  );

  return {
    userAvatar,
    loadAvatar,
    saveAvatar,
    removeAvatar,
    processAvatarUpload,
    getAvatarByUserId,
  };
};
