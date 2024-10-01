import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Switch } from 'react-native-paper';
import { VictoryPie, VictoryLabel, VictoryTooltip, VictoryBar, VictoryChart, VictoryAxis, VictoryStack } from 'victory-native';
import { Category } from '@/types/category';


const budgetExpensesCategories: Category[] = [
  {
    name: "Abonnements",
    subCategories: [
      { name: "Abonnements - Autres" },
      { name: "Câble / Satellite" },
      { name: "Internet" },
      { name: "Téléphone fixe" },
      { name: "Téléphonie mobile" }
    ]
  },
  {
    name: "Achats & Shopping",
    subCategories: [
      { name: "Achats & Shopping - Autres" },
      { name: "Articles de sport" },
      { name: "Cadeaux" },
      { name: "Films & DVDs" },
      { name: "High Tech" },
      { name: "Licences" },
      { name: "Livres" },
      { name: "Musique" },
      { name: "Vêtements/Chaussures" }
    ]
  },
  {
    name: "Alimentation & Restauration",
    subCategories: [
      { name: "Alimentation & Restauration - Autres" },
      { name: "Café" },
      { name: "Fast foods" },
      { name: "Restaurants" },
      { name: "Supermarché / Epicerie" }
    ]
  },
  {
    name: "Auto & Transports",
    subCategories: [
      { name: "Auto & Transports - Autres" },
      { name: "Assurance véhicule" },
      { name: "Billets d'avion" },
      { name: "Billets de train" },
      { name: "Carburant" },
      { name: "Entretien véhicule" },
      { name: "Location de véhicule" },
      { name: "Péage" },
      { name: "Stationnement" },
      { name: "Transports en commun" },
    ]
  },
  {
    name: "Banque",
    subCategories: [
      { name: "Banque - Autres" },
      { name: "Débit mensuel carte" },
      { name: "Epargne" },
      { name: "Frais bancaires" },
      { name: "Hypothèque" },
      { name: "Incidents de paiement" },
      { name: "Remboursement emprunt" },
      { name: "Services Bancaires" },
    ]
  },
  {
    name: "Dépenses pro",
    subCategories: [
      { name: "Comptabilité" },
      { name: "Conseils" },
      { name: "Cotisations Sociales" },
      { name: "Dépenses pro - Autres" },
      { name: "Fournitures de bureau" },
      { name: "Frais d'expéditions" },
      { name: "Frais d'impressions" },
      { name: "Frais de recrutement" },
      { name: "Frais juridique" },
      { name: "Maintenance bureaux" },
      { name: "Marketing" },
      { name: "Notes de frais" },
      { name: "Prévoyance" },
      { name: "Publicité" },
      { name: "Rémunérations dirigeants" },
      { name: "Salaires" },
      { name: "Services en ligne" },
      { name: "Sous-traitance" },
      { name: "Taxe d'apprentissage" },
    ],
  },
  {
    name: "Divers",
    subCategories: [
      { name: "A catégoriser" },
      { name: "Assurance" },
      { name: "Autres dépenses" },
      { name: "Dons" },
      { name: "Pressing" },
      { name: "Tabac" },
    ],
  },
  {
    name: "Esthétique & Soins",
    subCategories: [
      { name: "Coiffeur" },
      { name: "Cosmétique" },
      { name: "Esthétique" },
      { name: "Esthétique & Soins - Autres" },
      { name: "Spa & Massage" },
    ],
  },
  {
    name: "Impôts & Taxes",
    subCategories: [
      { name: "Amendes" },
      { name: "Impôts & Taxes - Autres" },
      { name: "Impôts fonciers" },
      { name: "Impôts sur le revenu" },
      { name: "Taxes" },
      { name: "TVA" },
    ],
  },
  {
    name: "Logement",
    subCategories: [
      { name: "Assurance habitation" },
      { name: "Charges diverses" },
      { name: "Décoration" },
      { name: "Eau" },
      { name: "Electricité" },
      { name: "Entretien" },
      { name: "Extérieur et jardin" },
      { name: "Gaz" },
      { name: "Logement - Autres" },
      { name: "Loyer" },
    ],
  },
  {
    name: "Loisirs & Sorties",
    subCategories: [
      { name: "Bars / Clubs" },
      { name: "Divertissements" },
      { name: "Frais Animaux" },
      { name: "Hobbies" },
      { name: "Hôtels" },
      { name: "Loisirs & Sorties - Autres" },
      { name: "Sortie au restaurant" },
      { name: "Sorties culturelles" },
      { name: "Sport" },
      { name: "Sports d'hiver" },
      { name: "Voyages / Vacances" },
    ],
  },
  {
    name: "Retraits, Chq. et Vir.",
    subCategories: [
      { name: "Chèques" },
      { name: "Retraits" },
      { name: "Virements" },  
      { name: "Virements internes" },
    ],
  },
  {
    name: "Santé",
    subCategories: [
      { name: "Dentiste" },
      { name: "Médecin" },
      { name: "Mutuelle" },
      { name: "Opticien / Ophtalmo." },
      { name: "Pharmacie" },
      { name: "Santé - Autres" },
    ],
  },
  {
    name: "Scolarité & Enfants",
    subCategories: [
      { name: "Baby-sitters & Crèches" },
      { name: "Ecole" },
      { name: "Fournitures scolaires" },
      { name: "Jouets" },
      { name: "Logement étudiant" },
      { name: "Pensions" },
      { name: "Prêt étudiant" },
      { name: "Scolarité & Enfants - Autres" },
    ],
  },
];

const budgetIncomesCategories = [
  {name: "Allocations et pensions"},
  {name: "Autres rentrées"},
  {name: "Dépôt d'argent"},
  {name: "Economies"},
  {name: "Emprunt"},
  {name: "Extra"},
  {name: "Intérêts"},
  {name: "Loyers reçus"},
  {name: "Remboursements"},
  {name: "Retraite"},
  {name: "Salaires"},
  {name: "Services"},
  {name: "Subventions"},
  {name: "Ventes"},
  {name: "Virements internes"},
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

// Mock data for budget categories over months
const budgetCategoriesOverMonths = [
  { month: 'Jan', Housing: 1000, Food: 500, Transportation: 300, Entertainment: 200 },
  { month: 'Feb', Housing: 1000, Food: 550, Transportation: 280, Entertainment: 220 },
  { month: 'Mar', Housing: 1000, Food: 480, Transportation: 310, Entertainment: 190 },
  { month: 'Apr', Housing: 1000, Food: 520, Transportation: 290, Entertainment: 210 },
  // Add more months as needed
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.periodSelector}>
          <Pressable onPress={() => changePeriod(-1)} style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </Pressable>
          <View>
            <Text style={styles.periodText}>{formatPeriod(currentDate, periodType)}</Text>
            <View style={styles.periodTypeSelector}>
              <Pressable
                onPress={() => setPeriodType('month')}
                style={[styles.periodTypeButton, periodType === 'month' && styles.activePeriodType]}
              >
                <Text style={[styles.periodTypeText, periodType === 'month' && styles.activePeriodTypeText]}>Mois</Text>
              </Pressable>
              <Pressable
                onPress={() => setPeriodType('quarter')}
                style={[styles.periodTypeButton, periodType === 'quarter' && styles.activePeriodType]}
              >
                <Text style={[styles.periodTypeText, periodType === 'quarter' && styles.activePeriodTypeText]}>Trimestre</Text>
              </Pressable>
              <Pressable
                onPress={() => setPeriodType('year')}
                style={[styles.periodTypeButton, periodType === 'year' && styles.activePeriodType]}
              >
                <Text style={[styles.periodTypeText, periodType === 'year' && styles.activePeriodTypeText]}>Année</Text>
              </Pressable>
            </View>
          </View>
          <Pressable onPress={() => changePeriod(1)} style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </Pressable>
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

        {/* New stacked bar chart for budget categories over months */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Budget Categories Over Months</Text>
          <VictoryChart
            domainPadding={{ x: 25 }}
            width={350}
            height={300}
          >
            <VictoryAxis
              tickValues={budgetCategoriesOverMonths.map(d => d.month)}
              style={{ tickLabels: { fontSize: 12, padding: 5 } }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `${t / 1000}k€`}
              style={{ tickLabels: { fontSize: 12, padding: 5 } }}
            />
            <VictoryStack colorScale={["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]}>
              {["Housing", "Food", "Transportation", "Entertainment"].map((category, index) => (
                <VictoryBar
                  key={index}
                  data={budgetCategoriesOverMonths}
                  x="month"
                  y={category}
                />
              ))}
            </VictoryStack>
          </VictoryChart>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
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
    marginVertical: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
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
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});