import { Image } from 'expo-image';

export function BrandLogo({ size = 180 }: { size?: number }) {
  return <Image source={require('../../../assets/images/brenns-logo-oficial.png')} contentFit="contain" style={{ width: size, height: size * 749 / 2098 }} accessibilityLabel="Logotipo oficial de Salón Brenn’s" />;
}
