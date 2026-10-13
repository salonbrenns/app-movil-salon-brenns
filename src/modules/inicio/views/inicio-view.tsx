import { Link } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { NavigationSections } from '@/constants/navigation';
import { useInicioViewModel } from '../viewmodels/use-inicio-view-model';
export default function InicioView() {
 const vm = useInicioViewModel();
 return <Screen title="Salón Brenn’s" subtitle="Selecciona una sección.">
  {vm.autenticado ? <ThemedText type="subtitle">{vm.saludo}</ThemedText> : null}
  <ThemedView surface="card">{Object.values(NavigationSections).map(section => <Link key={section.name} href={section.href} asChild><Button label={section.title} variant="secondary" /></Link>)}</ThemedView>
  {vm.autenticado ? <Link href="/cuenta/cerrar-sesion" asChild><Button label="Cerrar sesión" variant="secondary" /></Link> : null}
 </Screen>;
}
