import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Switch } from 'react-native-paper';
import { VictoryPie, VictoryLabel, VictoryTooltip } from 'victory-native';

// Définition de la structure des catégories
type SubCategory = string;
type Category = {
  name: string;
  subCategories: SubCategory[];
};

const budgetExpensesCategories: Category[] = [
  {
    name: "Abonnements",
    subCategories: [
      "Abonnements - Autres",
      "Câble / Satellite",
      "Internet",
      "Téléphone fixe",
      "Téléphonie mobile"
    ]
  },
  {
    name: "Achats & Shopping",
    subCategories: [
      "Achats & Shopping - Autres",
      "Articles de sport",
      "Cadeaux",
      "Films & DVDs",
      "High Tech",
      "Licences",
      "Livres",
      "Musique",
      "Vêtements/Chaussures"
    ]
  },
  {
    name: "Alimentation & Restauration",
    subCategories: [
      "Alimentation & Restauration - Autres",
      "Café",
      "Fast foods",
      "Restaurants",
      "Supermarché / Epicerie"
    ]
  },
  {
    name: "Auto & Transports",
    subCategories: [
      "Auto & Transports - Autres",
      "Assurance véhicule",
      "Billets d'avion",
      "Billets de train",
      "Carburant",
      "Entretien véhicule",
      "Location de véhicule",
      "Péage",
      "Stationnement",
      "Transports en commun",
    ]
  },
  {
    name: "Banque",
    subCategories: [
      "Banque - Autres",
      "Débit mensuel carte",
      "Epargne",
      "Frais bancaires",
      "Hypothèque",
      "Incidents de paiement",
      "Remboursement emprunt",
      "Services Bancaires",
    ]
  },
  {
    name: "Dépenses pro",
    subCategories: [
      "Comptabilité",
      "Conseils",
      "Cotisations Sociales",
      "Dépenses pro - Autres",
      "Fournitures de bureau",
      "Frais d'expéditions",
      "Frais d'impressions",
      "Frais de recrutement",
      "Frais juridique",
      "Maintenance bureaux",
      "Marketing",
      "Notes de frais",
      "Prévoyance",
      "Publicité",
      "Rémunérations dirigeants",
      "Salaires",
      "Services en ligne",
      "Sous-traitance",
      "Taxe d'apprentissage",
    ],
  },
  {
    name: "Divers",
    subCategories: [
      "A catégoriser",
      "Assurance",
      "Autres dépenses",
      "Dons",
      "Pressing",
      "Tabac",
    ],
  },
  {
    name: "Esthétique & Soins",
    subCategories: [
      "Coiffeur",
      "Cosmétique",
      "Esthétique",
      "Esthétique & Soins - Autres",
      "Spa & Massage",
    ],
  },
  {
    name: "Impôts & Taxes",
    subCategories: [
      "Amendes",
      "Impôts & Taxes - Autres",
      "Impôts fonciers",
      "Impôts sur le revenu",
      "Taxes",
      "TVA",
    ],
  },
  {
    name: "Logement",
    subCategories: [
      "Assurance habitation",
      "Charges diverses",
      "Décoration",
      "Eau",
      "Electricité",
      "Entretien",
      "Extérieur et jardin",
      "Gaz",
      "Logement - Autres",
      "Loyer"
    ],
  },
  {
    name: "Loisirs & Sorties",
    subCategories: [
      "Bars / Clubs",
      "Divertissements",
      "Frais Animaux",
      "Hobbies",
      "Hôtels",
      "Loisirs & Sorties - Autres",
      "Sortie au restaurant",
      "Sorties culturelles",
      "Sport",
      "Sports d'hiver",
      "Voyages / Vacances",
    ],
  },
  {
    name: "Retraits, Chq. et Vir.",
    subCategories: [
      "Chèques",
      "Retraits",
      "Virements",
      "Virements internes",
    ],
  },
  {
    name: "Santé",
    subCategories: [
      "Dentiste",
      "Médecin",
      "Mutuelle",
      "Opticien / Ophtalmo.",
      "Pharmacie",
      "Santé - Autres",
    ],
  },
  {
    name: "Scolarité & Enfants",
    subCategories: [
      "Baby-sitters & Crèches",
      "Ecole",
      "Fournitures scolaires",
      "Jouets",
      "Logement étudiant",
      "Pensions",
      "Prêt étudiant",
      "Scolarité & Enfants - Autres",
    ],
  },
];

const budgetIncomesCategories = [
  "Allocations et pensions",
  "Autres rentrées",
  "Dépôt d'argent",
  "Economies",
  "Emprunt",
  "Extra",
  "Intérêts",
  "Loyers reçus",
  "Remboursements",
  "Retraite",
  "Salaires",
  "Services",
  "Subventions",
  "Ventes",
  "Virements internes",
];

type PeriodType = 'month' | 'quarter' | 'year';
type BudgetType = 'income' | 'expense';

// Ajoutez ces données mock pour le graphique en donut
const mockExpenseData = [
  { x: "Abonnements", y: 500, color: '#600080' },
  { x: "Achats & Shopping", y: 300, color: '#9900cc' },
  { x: "Alimentation & Restauration", y: 800, color: '#c61aff' },
  { x: "Auto & Transports", y: 400, color: '#d966ff' },
  { x: "Autres", y: 200, color: '#ecb3ff' },
];

const mockIncomeData = [
  { x: "Salaires", y: 2000, color: '#006600' },
  { x: "Allocations", y: 500, color: '#00b300' },
  { x: "Revenus locatifs", y: 300, color: '#00ff00' },
  { x: "Autres", y: 200, color: '#66ff66' },
];

export default function BudgetScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [budgetType, setBudgetType] = useState<BudgetType>('expense');

  const formatPeriod = (date: Date, type: PeriodType) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric' };
    switch (type) {
      case 'month':
        options.month = 'long';
        break;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      case 'year':
        return date.getFullYear().toString();
    }
    return date.toLocaleString('default', options);
  };

  const changePeriod = (increment: number) => {
    const newDate = new Date(currentDate);
    switch (periodType) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + increment);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (3 * increment));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + increment);
        break;
    }
    setCurrentDate(newDate);
  };

  const chartData = budgetType === 'expense' ? mockExpenseData : mockIncomeData;
  const totalAmount = chartData.reduce((sum, item) => sum + item.y, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.periodSelector}>
        <TouchableOpacity onPress={() => changePeriod(-1)} style={styles.arrowButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View>
          <Text style={styles.periodText}>{formatPeriod(currentDate, periodType)}</Text>
          <View style={styles.periodTypeSelector}>
            <TouchableOpacity
              onPress={() => setPeriodType('month')}
              style={[styles.periodTypeButton, periodType === 'month' && styles.activePeriodType]}
            >
              <Text style={[styles.periodTypeText, periodType === 'month' && styles.activePeriodTypeText]}>Mois</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPeriodType('quarter')}
              style={[styles.periodTypeButton, periodType === 'quarter' && styles.activePeriodType]}
            >
              <Text style={[styles.periodTypeText, periodType === 'quarter' && styles.activePeriodTypeText]}>Trimestre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPeriodType('year')}
              style={[styles.periodTypeButton, periodType === 'year' && styles.activePeriodType]}
            >
              <Text style={[styles.periodTypeText, periodType === 'year' && styles.activePeriodTypeText]}>Année</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => changePeriod(1)} style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.budgetTypeSelector}>
        <Text style={[styles.budgetTypeText, budgetType === 'income' ? styles.activeBudgetType : {}]}>Income</Text>
        <Switch
          value={budgetType === 'income'}
          onValueChange={(value) => setBudgetType(value ? 'income' : 'expense')}
          color="#007AFF"
        />
        <Text style={[styles.budgetTypeText, budgetType === 'expense' ? styles.activeBudgetType : {}]}>Expense</Text>
      </View>

      {/* budget pie chart */}
      <View style={styles.chartContainer}>
        <VictoryPie
          data={chartData}
          colorScale={chartData.map(item => item.color)}
          radius={({ datum }) => 100 + datum.y / 20}
          innerRadius={80}
          labelRadius={({ innerRadius }) => (innerRadius as number) + 30 }
          style={{ labels: { fill: "white", fontSize: 14, fontWeight: "bold" } }}
          width={300} height={300}
          labelComponent={
            <VictoryTooltip
              renderInPortal={false}
              flyoutStyle={{ fill: "black", stroke: "none" }}
            />
          }
        />
        <View style={styles.chartCenter}>
          <Text style={styles.chartCenterAmount}>{totalAmount.toLocaleString()} €</Text>
          <Text style={styles.chartCenterLabel}>{budgetType === 'expense' ? 'Dépenses' : 'Revenus'}</Text>
        </View>
      </View>

      {/* Légende du graphique */}
      <View style={styles.chartLegend}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.x}</Text>
            <Text style={styles.legendValue}>{item.y.toLocaleString()} €</Text>
          </View>
        ))}
      </View>

      {/* <Text style={styles.title}>Catégories de Budget</Text>
      {budgetType === 'expense' ? (
        budgetExpensesCategories.map((category, index) => (
          <View key={index} style={styles.categoryContainer}>
            <Text style={styles.categoryName}>{category.name}</Text>
            {category.subCategories.map((subCategory, subIndex) => (
              <Text key={subIndex} style={styles.subCategory}>
                • {subCategory}
              </Text>
            ))}
          </View>
        ))
      ) : (
        budgetIncomesCategories.map((category, index) => (
          <View key={index} style={styles.categoryContainer}>
            <Text style={styles.categoryName}>{category}</Text>
          </View>
        ))
      )} */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subCategory: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 4,
    color: '#666',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  arrowButton: {
    padding: 10,
  },
  periodText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  periodTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  periodTypeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  activePeriodType: {
    backgroundColor: '#007AFF',
  },
  periodTypeText: {
    fontSize: 12,
    color: '#333',
  },
  activePeriodTypeText: {
    color: '#fff',
  },
  budgetTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 16,
    borderRadius: 8,
  },
  budgetTypeText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#333',
  },
  activeBudgetType: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  chartCenterLabel: {
    fontSize: 16,
    color: '#666',
  },
  chartLegend: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});