import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { CustomInput } from '@/components/ui/text-field';
import { StatusMessage } from '@/components/feedback/status-message';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { usePerfilViewModel } from '../viewmodels/use-perfil-view-model';
import { useEditarPerfilViewModel } from '../viewmodels/use-editar-perfil-view-model';
import type { Perfil } from '../models/perfil';

export function EditarPerfilView() {
  const resource = usePerfilViewModel();
  return <View style={styles.form}>
    {resource.cargando ? <ThemedText type="small">Cargando perfil…</ThemedText> : null}
    {resource.error ? <StatusMessage message={resource.error} /> : null}
    {resource.perfil ? <EditarPerfilForm key={resource.perfil.correo} perfil={resource.perfil} recargar={resource.recargar} /> : null}
  </View>;
}

function EditarPerfilForm({ perfil, recargar }: { perfil: Perfil; recargar: () => Promise<void> }) {
  const vm = useEditarPerfilViewModel(perfil, recargar);
  return <View style={styles.form}>
    <CustomInput label="Nombre completo" value={vm.nombre} onChangeText={vm.setNombre} autoComplete="name" editable={!vm.busy} />
    <CustomInput label="Teléfono" value={vm.telefono} onChangeText={vm.setTelefono} keyboardType="phone-pad" autoComplete="tel" editable={!vm.busy} />
    <ThemedText type="small" themeColor="textSecondary">Correo: {perfil.correo}</ThemedText>
    {vm.error ? <StatusMessage message={vm.error} /> : null}
    {vm.saved ? <StatusMessage message="Perfil actualizado." tone="success" /> : null}
    <Button label="Guardar cambios" loading={vm.busy} disabled={vm.busy} onPress={() => { void vm.save(); }} />
  </View>;
}
