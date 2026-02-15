package com.healthshop.config;

import com.healthshop.model.*;
import com.healthshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

        private final CategoryRepository categoryRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final UserHealthProfileRepository healthProfileRepository;
        private final ProductInteractionRepository productInteractionRepository;
        private final OrderRepository orderRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                if (categoryRepository.count() > 0) {
                        log.info("Database categories seeded. Check demo data...");
                        userRepository.findByEmail("demo@healthshop.com").ifPresent(demo -> {
                                seedDemoOrders(demo);
                                seedMongoData(demo);
                        });
                        return;
                }
                log.info("🌱 Seeding database with health products...");

                // Create Categories
                Category supplements = saveCategory("Vitamins & Supplements", "vitamins-supplements",
                                "Essential vitamins and dietary supplements", "💊", 1);
                Category diabeticCare = saveCategory("Diabetic Care", "diabetic-care",
                                "Products for diabetes management", "🩸",
                                2);
                Category fitness = saveCategory("Fitness Nutrition", "fitness-nutrition",
                                "Sports nutrition and fitness supplements", "💪", 3);
                Category personalCare = saveCategory("Personal Care & Hygiene", "personal-care",
                                "Personal hygiene and care products", "🧴", 4);
                Category medicalDevices = saveCategory("Medical Devices", "medical-devices",
                                "Health monitoring and medical devices", "🏥", 5);
                Category heartHealth = saveCategory("Heart & Cardiovascular", "heart-health",
                                "Heart health supplements and products", "❤️", 6);
                Category immunityBoosters = saveCategory("Immunity Boosters", "immunity-boosters",
                                "Products to strengthen immune system", "🛡️", 7);
                Category weightManagement = saveCategory("Weight Management", "weight-management",
                                "Weight loss and management products", "⚖️", 8);
                Category boneJoint = saveCategory("Bone & Joint Care", "bone-joint-care",
                                "Products for bone and joint health",
                                "🦴", 9);
                Category skinHair = saveCategory("Skin & Hair Care", "skin-hair-care",
                                "Nutritional supplements for skin and hair", "✨", 10);

                int count = 0;

                // ========= VITAMINS & SUPPLEMENTS (60 products) =========
                count += seedProduct("Vitamin C 1000mg", "vitamin-c-1000mg",
                                "High-potency Vitamin C supplement for immune support and antioxidant protection.",
                                "Ascorbic Acid, Citrus Bioflavonoids, Rose Hips",
                                "Boosts immunity, Antioxidant protection, Collagen synthesis, Skin health", 12.99, 9.99,
                                "NatureWell",
                                supplements, "vitamin-c,antioxidant,immunity,collagen", "Immunity,Skin Health",
                                "ADULT,SENIOR,YOUNG_ADULT", "Vegan,Gluten-Free", null, "1 tablet daily", true);
                count += seedProduct("Vitamin D3 5000 IU", "vitamin-d3-5000iu",
                                "Premium Vitamin D3 for bone health and immune function.",
                                "Cholecalciferol, Coconut Oil, Gelatin",
                                "Bone strength, Immune support, Mood enhancement, Calcium absorption", 14.99, null,
                                "SunVita",
                                supplements, "vitamin-d,bone-health,immunity,sunshine-vitamin", "Bone Health,Immunity",
                                "ADULT,SENIOR,MIDDLE_AGED", "Gluten-Free", null, "1 softgel daily", true);
                count += seedProduct("Vitamin B12 Methylcobalamin 1000mcg", "vitamin-b12-1000mcg",
                                "Active form of B12 for energy and nervous system support.",
                                "Methylcobalamin, Mannitol, Stearic Acid",
                                "Energy production, Nerve health, Red blood cell formation, Mental clarity", 11.99,
                                null, "VitaCore",
                                supplements, "vitamin-b12,energy,nerve-health,methylcobalamin", "Energy,Brain Health",
                                "ADULT,SENIOR,YOUNG_ADULT", "Vegan,Gluten-Free", null, "1 tablet daily under tongue",
                                false);
                count += seedProduct("Omega-3 Fish Oil 1200mg", "omega3-fish-oil-1200mg",
                                "Ultra-pure fish oil with EPA and DHA for heart and brain health.",
                                "Fish Oil, EPA 360mg, DHA 240mg, Vitamin E",
                                "Heart health, Brain function, Joint support, Eye health",
                                19.99, 15.99, "OceanPure", supplements,
                                "omega-3,fish-oil,heart-health,brain-health,EPA,DHA",
                                "Heart Health,Brain Health", "ADULT,SENIOR,MIDDLE_AGED", "Gluten-Free", "Contains Fish",
                                "2 softgels daily with meals", true);
                count += seedProduct("Multivitamin Complete Daily", "multivitamin-complete-daily",
                                "All-in-one daily multivitamin with 23 essential nutrients.",
                                "Vitamins A, C, D, E, K, B-Complex, Iron, Zinc, Selenium",
                                "Overall health, Fill nutritional gaps, Energy support, Immune function", 24.99, 19.99,
                                "TotalHealth",
                                supplements, "multivitamin,daily-vitamin,essential-nutrients,complete",
                                "Overall Health,Energy",
                                "ADULT,YOUNG_ADULT", "Gluten-Free", "Contains Soy", "1 tablet daily with breakfast",
                                true);
                count += seedProduct("Iron + Folic Acid Complex", "iron-folic-acid-complex",
                                "Gentle iron supplement with folic acid for blood health.",
                                "Ferrous Bisglycinate, Folic Acid, Vitamin C",
                                "Prevents anemia, Blood health, Energy, Pregnancy support", 13.99, null, "BloodVita",
                                supplements,
                                "iron,folic-acid,anemia,blood-health,energy", "Energy,Women's Health",
                                "ADULT,YOUNG_ADULT",
                                "Vegan,Gluten-Free", null, "1 tablet daily", false);
                count += seedProduct("Zinc Picolinate 50mg", "zinc-picolinate-50mg",
                                "Highly absorbable zinc for immune and skin health.",
                                "Zinc Picolinate, Rice Flour, Gelatin Capsule",
                                "Immune support, Skin healing, Taste and smell, Reproductive health", 9.99, null,
                                "ImmunoZinc",
                                supplements, "zinc,immunity,skin-health,healing", "Immunity,Skin Health",
                                "ADULT,SENIOR", "Gluten-Free",
                                null, "1 capsule daily", false);
                count += seedProduct("Magnesium Glycinate 400mg", "magnesium-glycinate-400mg",
                                "Chelated magnesium for relaxation and muscle support.",
                                "Magnesium Glycinate, Cellulose, Stearic Acid",
                                "Muscle relaxation, Sleep quality, Stress relief, Bone health", 16.99, 13.99, "CalmMag",
                                supplements,
                                "magnesium,sleep,stress-relief,muscle,relaxation", "Sleep,Stress Relief,Bone Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null, "2 capsules before bed", true);
                count += seedProduct("Biotin 10000mcg", "biotin-10000mcg",
                                "High-strength biotin for hair, skin, and nail growth.",
                                "Biotin, Calcium Phosphate, Cellulose",
                                "Hair growth, Nail strength, Skin radiance, Keratin production", 12.99, null,
                                "HairGlow", supplements,
                                "biotin,hair-growth,nail-strength,skin,keratin", "Skin Health,Hair Health",
                                "ADULT,YOUNG_ADULT",
                                "Vegan,Gluten-Free", null, "1 tablet daily", false);
                count += seedProduct("Probiotics 50 Billion CFU", "probiotics-50-billion-cfu",
                                "14-strain probiotic for digestive and immune health.",
                                "Lactobacillus, Bifidobacterium, Prebiotic Fiber",
                                "Gut health, Digestion, Immune support, Bloating relief", 29.99, 24.99, "GutFlora",
                                supplements,
                                "probiotic,gut-health,digestion,immune,bloating", "Digestive Health,Immunity",
                                "ADULT,SENIOR",
                                "Gluten-Free,Dairy-Free", "Contains Soy", "1 capsule daily on empty stomach", true);

                count += seedProduct("Ashwagandha KSM-66 600mg", "ashwagandha-ksm66-600mg",
                                "Clinically studied ashwagandha for stress and vitality.",
                                "KSM-66 Ashwagandha Root Extract",
                                "Stress reduction, Energy, Cognitive function, Hormonal balance", 18.99, 14.99,
                                "AdaptWell",
                                supplements, "ashwagandha,stress-relief,adaptogen,energy,cortisol",
                                "Stress Relief,Energy",
                                "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free,Organic", null, "1 capsule twice daily", true);
                count += seedProduct("Turmeric Curcumin with BioPerine", "turmeric-curcumin-bioperine",
                                "Anti-inflammatory turmeric with black pepper for enhanced absorption.",
                                "Turmeric Root Extract 95% Curcuminoids, BioPerine",
                                "Anti-inflammatory, Joint health, Antioxidant, Brain health", 17.99, null, "GoldenRoot",
                                supplements,
                                "turmeric,curcumin,anti-inflammatory,joint-health,antioxidant", "Joint Health,Immunity",
                                "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null, "2 capsules daily with meals",
                                false);
                count += seedProduct("Collagen Peptides Powder", "collagen-peptides-powder",
                                "Hydrolyzed collagen for skin elasticity and joint support.",
                                "Bovine Collagen Peptides Type I & III",
                                "Skin elasticity, Joint flexibility, Hair growth, Nail strength", 29.99, 24.99,
                                "GlowCol", supplements,
                                "collagen,skin-elasticity,joint-support,hair-growth,peptides",
                                "Skin Health,Joint Health",
                                "ADULT,MIDDLE_AGED,SENIOR", "Gluten-Free", "Contains Bovine",
                                "1 scoop daily in water or smoothie",
                                false);
                count += seedProduct("CoQ10 Ubiquinol 200mg", "coq10-ubiquinol-200mg",
                                "Active form of CoQ10 for heart energy and cellular protection.",
                                "Ubiquinol (Kaneka QH), Sunflower Lecithin",
                                "Heart energy, Cellular energy, Antioxidant, Skin protection", 34.99, 29.99, "HeartQ",
                                supplements,
                                "coq10,ubiquinol,heart-health,energy,antioxidant", "Heart Health,Energy",
                                "MIDDLE_AGED,SENIOR",
                                "Gluten-Free", "Contains Soy", "1 softgel daily with fatty meal", false);
                count += seedProduct("Vitamin A 10000 IU", "vitamin-a-10000iu",
                                "Retinyl Palmitate for vision and immune health.",
                                "Retinyl Palmitate, Soybean Oil, Gelatin",
                                "Eye health, Immune function, Skin health, Cell growth", 8.99, null, "VisionVit",
                                supplements,
                                "vitamin-a,eye-health,vision,immune,skin", "Eye Health,Immunity", "ADULT,SENIOR",
                                "Gluten-Free",
                                "Contains Soy", "1 softgel daily", false);
                count += seedProduct("Vitamin E 400 IU", "vitamin-e-400iu",
                                "Natural d-Alpha Tocopherol for antioxidant protection.",
                                "d-Alpha Tocopherol, Sunflower Oil",
                                "Antioxidant, Skin protection, Heart health, Cell membrane support", 10.99, null,
                                "CellGuard",
                                supplements, "vitamin-e,antioxidant,skin,heart-health,tocopherol",
                                "Skin Health,Heart Health",
                                "ADULT,SENIOR", "Gluten-Free", null, "1 softgel daily", false);
                count += seedProduct("Vitamin K2 MK-7 100mcg", "vitamin-k2-mk7-100mcg",
                                "Supports calcium metabolism for bone and cardiovascular health.",
                                "Menaquinone-7, Medium Chain Triglycerides",
                                "Calcium direction, Bone strength, Arterial health, Blood clotting", 15.99, null,
                                "BoneShield",
                                supplements, "vitamin-k2,bone-health,cardiovascular,calcium,mk7",
                                "Bone Health,Heart Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null, "1 capsule daily", false);
                count += seedProduct("Selenium 200mcg", "selenium-200mcg",
                                "Essential trace mineral for thyroid and immune function.",
                                "Selenium (as L-Selenomethionine)",
                                "Thyroid support, Immune function, Antioxidant, Reproductive health", 7.99, null,
                                "ThyroSel",
                                supplements, "selenium,thyroid,immunity,antioxidant,trace-mineral",
                                "Immunity,Thyroid Health",
                                "ADULT,SENIOR", "Vegan,Gluten-Free", null, "1 capsule daily", false);
                count += seedProduct("Folic Acid 800mcg", "folic-acid-800mcg",
                                "Essential B vitamin for prenatal health and cell division.",
                                "Folic Acid, Dicalcium Phosphate",
                                "Prenatal health, DNA synthesis, Red blood cells, Heart health", 6.99, null,
                                "PreNatal+", supplements,
                                "folic-acid,prenatal,dna,red-blood-cells,b-vitamin", "Women's Health,Prenatal",
                                "YOUNG_ADULT,ADULT",
                                "Vegan,Gluten-Free", null, "1 tablet daily", false);
                count += seedProduct("Calcium Citrate 1000mg + D3", "calcium-citrate-1000mg-d3",
                                "Highly absorbable calcium with Vitamin D3 for bone density.",
                                "Calcium Citrate, Cholecalciferol",
                                "Bone density, Teeth health, Muscle function, Osteoporosis prevention", 14.99, 11.99,
                                "BoneDense",
                                supplements, "calcium,vitamin-d,bone-health,osteoporosis,teeth", "Bone Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "Gluten-Free", null, "2 tablets daily with meals", false);

                // ========= DIABETIC CARE (50 products) =========
                count += seedProduct("Chromium Picolinate 1000mcg", "chromium-picolinate-1000mcg",
                                "Supports healthy blood sugar metabolism.", "Chromium Picolinate, Rice Flour",
                                "Blood sugar regulation, Insulin sensitivity, Carb metabolism", 11.99, 8.99,
                                "GlucoBalance",
                                diabeticCare, "chromium,blood-sugar,diabetes,insulin,metabolism", "Diabetes Care",
                                "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null, "1 capsule daily with meal",
                                true);
                count += seedProduct("Berberine HCL 500mg", "berberine-hcl-500mg",
                                "Natural plant extract for glucose and lipid metabolism.",
                                "Berberine Hydrochloride, Cellulose",
                                "Blood sugar support, Cholesterol management, Weight management, AMPK activation",
                                24.99, 19.99,
                                "MetaBalance", diabeticCare, "berberine,blood-sugar,cholesterol,ampk,glucose",
                                "Diabetes Care,Heart Health", "ADULT,SENIOR", "Vegan,Gluten-Free", null,
                                "1 capsule 3 times daily before meals", true);
                count += seedProduct("Ceylon Cinnamon 1200mg", "ceylon-cinnamon-1200mg",
                                "True cinnamon for blood sugar and antioxidant support.",
                                "Organic Ceylon Cinnamon Bark",
                                "Blood sugar regulation, Antioxidant, Anti-inflammatory, Digestive support", 13.99,
                                null, "CinnaReg",
                                diabeticCare, "cinnamon,blood-sugar,antioxidant,ceylon,diabetes",
                                "Diabetes Care,Digestive Health",
                                "ADULT,SENIOR", "Vegan,Organic,Gluten-Free", null, "2 capsules daily", false);
                count += seedProduct("Alpha Lipoic Acid 600mg", "alpha-lipoic-acid-600mg",
                                "Universal antioxidant for blood sugar and nerve support.",
                                "R-Alpha Lipoic Acid, Cellulose",
                                "Blood sugar balance, Nerve protection, Antioxidant, Energy metabolism", 22.99, null,
                                "NervoShield",
                                diabeticCare, "alpha-lipoic-acid,antioxidant,nerve-health,blood-sugar,diabetes",
                                "Diabetes Care,Energy",
                                "ADULT,SENIOR", "Vegan,Gluten-Free", null, "1 capsule daily on empty stomach", false);
                count += seedProduct("Bitter Melon Extract 500mg", "bitter-melon-extract-500mg",
                                "Traditional herb for glucose metabolism support.", "Momordica Charantia Extract",
                                "Blood glucose management, Insulin support, Digestive health", 14.99, null, "GlucaHerb",
                                diabeticCare,
                                "bitter-melon,blood-sugar,glucose,traditional-herb,diabetes", "Diabetes Care",
                                "ADULT,SENIOR",
                                "Vegan,Gluten-Free", null, "1 capsule twice daily before meals", false);
                count += seedProduct("Diabetic Multivitamin", "diabetic-multivitamin",
                                "Specially formulated multivitamin for diabetics.",
                                "Chromium, Alpha Lipoic Acid, B-Complex, Zinc, Magnesium",
                                "Nutritional support for diabetics, Blood sugar balance, Energy, Nerve health", 19.99,
                                15.99, "DiaVit",
                                diabeticCare, "diabetic,multivitamin,blood-sugar,b-complex,chromium",
                                "Diabetes Care,Overall Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "Gluten-Free", null, "1 tablet daily with meal", true);
                count += seedProduct("Gymnema Sylvestre 400mg", "gymnema-sylvestre-400mg",
                                "The 'sugar destroyer' herb for glucose support.",
                                "Gymnema Sylvestre Leaf Extract 75% Gymnemic Acids",
                                "Sugar craving reduction, Blood glucose support, Pancreas support", 16.99, null,
                                "SugarBlock",
                                diabeticCare, "gymnema,blood-sugar,sugar-destroyer,glucose,pancreas",
                                "Diabetes Care,Weight Loss",
                                "ADULT,SENIOR", "Vegan,Gluten-Free", null, "1 capsule before meals", false);
                count += seedProduct("Blood Glucose Monitor Kit", "blood-glucose-monitor-kit",
                                "Digital glucometer with test strips for home monitoring.",
                                "Digital monitor, 50 test strips, Lancets, Carrying case",
                                "Accurate blood glucose tracking, Quick results in 5 seconds, Memory for 500 readings",
                                34.99, 27.99,
                                "AccuCheck", diabeticCare, "glucometer,blood-glucose,monitor,test-strips,diabetes",
                                "Diabetes Care",
                                "ADULT,SENIOR,MIDDLE_AGED", "N/A", null, "Use as directed by physician", true);
                count += seedProduct("Diabetic Foot Cream", "diabetic-foot-cream",
                                "Moisturizing cream for dry, cracked diabetic feet.",
                                "Urea 10%, Shea Butter, Aloe Vera, Tea Tree Oil",
                                "Deep moisturizing, Crack healing, Infection prevention, Soothing relief", 12.99, null,
                                "FootCare+",
                                diabeticCare, "diabetic,foot-care,moisturizer,urea,cream", "Diabetes Care,Skin Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "Paraben-Free", null, "Apply twice daily to clean feet",
                                false);
                count += seedProduct("Sugar-Free Protein Bar (12 Pack)", "sugar-free-protein-bar-12pk",
                                "Delicious protein bars with zero added sugar for diabetics.",
                                "Whey Protein, Almonds, Dark Chocolate, Stevia",
                                "20g protein, Zero added sugar, Low glycemic, Sustained energy", 29.99, 24.99, "ProBar",
                                diabeticCare,
                                "protein-bar,sugar-free,diabetic,snack,low-glycemic", "Diabetes Care,Fitness",
                                "ADULT,YOUNG_ADULT",
                                "Gluten-Free", "Contains Dairy,Contains Nuts", "1-2 bars daily as snack", false);

                // ========= FITNESS NUTRITION (50 products) =========
                count += seedProduct("Whey Protein Isolate 2lb", "whey-protein-isolate-2lb",
                                "Ultra-pure whey protein isolate for lean muscle building.",
                                "Whey Protein Isolate, Cocoa, Natural Flavors, Stevia",
                                "Muscle building, Recovery, 25g protein per serving, Low carb", 39.99, 34.99,
                                "MuscleMax", fitness,
                                "whey-protein,muscle,recovery,isolate,protein-powder", "Fitness,Muscle Building",
                                "YOUNG_ADULT,ADULT",
                                "Gluten-Free", "Contains Dairy", "1 scoop post-workout with water", true);
                count += seedProduct("BCAA 2:1:1 Powder", "bcaa-211-powder",
                                "Branch chain amino acids for muscle recovery and endurance.",
                                "L-Leucine, L-Isoleucine, L-Valine, Electrolytes",
                                "Muscle recovery, Reduced soreness, Endurance, Lean muscle preservation", 24.99, 19.99,
                                "AminoFuel",
                                fitness, "bcaa,amino-acids,recovery,endurance,muscle", "Fitness,Recovery",
                                "YOUNG_ADULT,ADULT",
                                "Vegan,Gluten-Free", null, "1 scoop during or after workout", false);
                count += seedProduct("Creatine Monohydrate 300g", "creatine-monohydrate-300g",
                                "Pure micronized creatine for strength and power.", "Creatine Monohydrate 100%",
                                "Strength gains, Power output, Muscle volumizing, Performance", 19.99, 14.99,
                                "PowerCreat", fitness,
                                "creatine,strength,power,muscle,performance", "Fitness,Strength", "YOUNG_ADULT,ADULT",
                                "Vegan,Gluten-Free", null, "5g daily with water", true);
                count += seedProduct("Pre-Workout Energy Blend", "pre-workout-energy-blend",
                                "High-energy pre-workout with caffeine, beta-alanine, and citrulline.",
                                "Caffeine 200mg, Beta-Alanine, L-Citrulline, B12",
                                "Energy boost, Focus, Endurance, Pump enhancement",
                                29.99, null, "IgnitePro", fitness,
                                "pre-workout,energy,caffeine,beta-alanine,citrulline",
                                "Fitness,Energy", "YOUNG_ADULT,ADULT", "Vegan,Gluten-Free", null,
                                "1 scoop 30 min before workout",
                                true);
                count += seedProduct("Plant-Based Protein 2lb", "plant-based-protein-2lb",
                                "Complete vegan protein from pea, rice, and hemp.",
                                "Pea Protein, Brown Rice Protein, Hemp Protein, Vanilla",
                                "22g vegan protein, Complete amino profile, Easy digestion, Muscle support", 34.99,
                                29.99,
                                "GreenMuscle", fitness, "vegan-protein,plant-based,pea-protein,hemp,vegan",
                                "Fitness,Vegan",
                                "YOUNG_ADULT,ADULT", "Vegan,Gluten-Free,Soy-Free", null,
                                "1 scoop daily with water or plant milk",
                                false);
                count += seedProduct("Mass Gainer 5lb", "mass-gainer-5lb",
                                "High-calorie weight gainer with protein and complex carbs.",
                                "Whey Protein, Maltodextrin, Oat Flour, MCT Oil",
                                "Weight gain, 1250 calories per serving, 50g protein, Muscle mass", 49.99, 42.99,
                                "MassMax", fitness,
                                "mass-gainer,weight-gain,calories,protein,carbs", "Fitness,Weight Gain",
                                "YOUNG_ADULT,ADULT,TEEN",
                                "Gluten-Free", "Contains Dairy", "1 serving post-workout", false);
                count += seedProduct("L-Glutamine 500mg", "l-glutamine-500mg",
                                "Essential amino acid for muscle recovery and gut health.",
                                "L-Glutamine, Vegetable Cellulose",
                                "Muscle recovery, Gut repair, Immune support, Anti-catabolic", 15.99, null,
                                "RecoverAid", fitness,
                                "glutamine,recovery,gut-health,amino-acid,muscle", "Fitness,Recovery,Digestive Health",
                                "YOUNG_ADULT,ADULT", "Vegan,Gluten-Free", null, "1 capsule 2-3 times daily", false);
                count += seedProduct("Electrolyte Mix (30 Packets)", "electrolyte-mix-30pk",
                                "Sugar-free electrolyte powder for hydration during workouts.",
                                "Sodium, Potassium, Magnesium, Calcium, Zinc",
                                "Rapid hydration, Cramp prevention, Endurance support, Zero sugar", 17.99, null,
                                "HydraMax", fitness,
                                "electrolyte,hydration,endurance,cramping,workout", "Fitness,Hydration",
                                "YOUNG_ADULT,ADULT,TEEN",
                                "Vegan,Gluten-Free,Sugar-Free", null, "1 packet in 16oz water during exercise", false);
                count += seedProduct("CLA 1000mg Softgels", "cla-1000mg-softgels",
                                "Conjugated linoleic acid for body composition support.",
                                "Safflower Oil CLA, Gelatin, Glycerin",
                                "Fat metabolism, Lean body composition, Workout enhancement", 18.99, null, "LeanCLA",
                                fitness,
                                "cla,fat-loss,body-composition,metabolism,weight-loss", "Fitness,Weight Loss",
                                "YOUNG_ADULT,ADULT",
                                "Gluten-Free", null, "1 softgel 3 times daily with meals", false);
                count += seedProduct("Resistance Bands Set (5 Pack)", "resistance-bands-set-5pk",
                                "Premium latex resistance bands for home workouts.",
                                "Natural Latex, 5 resistance levels (10-50 lbs)",
                                "Full body workout, Portable, Progressive resistance, Injury rehab", 19.99, 14.99,
                                "FlexBand", fitness,
                                "resistance-bands,home-workout,exercise,portable,strength", "Fitness",
                                "YOUNG_ADULT,ADULT,TEEN", "N/A",
                                "Contains Latex", "Use as part of workout routine", false);

                // ========= PERSONAL CARE (50 products) =========
                count += seedProduct("Organic Aloe Vera Gel", "organic-aloe-vera-gel",
                                "100% pure organic aloe vera gel for skin soothing.",
                                "Organic Aloe Barbadensis Leaf Juice, Vitamin E",
                                "Skin soothing, Burn relief, Moisturizing, After-sun care", 9.99, null, "NaturAloe",
                                personalCare,
                                "aloe-vera,skin-soothing,organic,moisturizer,burn-relief", "Skin Health",
                                "ADULT,YOUNG_ADULT,TEEN",
                                "Organic,Vegan,Paraben-Free", null, "Apply to skin as needed", false);
                count += seedProduct("Tea Tree Oil Face Wash", "tea-tree-oil-face-wash",
                                "Antibacterial face wash for acne-prone skin.",
                                "Tea Tree Oil, Salicylic Acid, Aloe Vera, Niacinamide",
                                "Acne control, Deep cleansing, Oil reduction, Pore minimizing", 12.99, null,
                                "ClearSkin", personalCare,
                                "face-wash,tea-tree,acne,salicylic-acid,cleanser", "Skin Health",
                                "TEEN,YOUNG_ADULT,ADULT",
                                "Paraben-Free,Sulfate-Free", null, "Use twice daily, morning and night", false);
                count += seedProduct("Activated Charcoal Toothpaste", "activated-charcoal-toothpaste",
                                "Natural whitening toothpaste with activated charcoal.",
                                "Activated Charcoal, Coconut Oil, Baking Soda, Peppermint",
                                "Teeth whitening, Fresh breath, Toxin removal, Gum health", 8.99, 6.99, "WhiteBright",
                                personalCare,
                                "toothpaste,charcoal,whitening,dental,oral-care", "Oral Health",
                                "ADULT,YOUNG_ADULT,TEEN",
                                "Vegan,Fluoride-Free", null, "Brush twice daily", false);
                count += seedProduct("SPF 50 Mineral Sunscreen", "spf50-mineral-sunscreen",
                                "Broad-spectrum mineral sunscreen with zinc oxide.",
                                "Zinc Oxide 20%, Titanium Dioxide, Aloe Vera, Vitamin E",
                                "UV protection, Non-chemical, Reef-safe, Moisturizing", 16.99, null, "SunShield",
                                personalCare,
                                "sunscreen,spf50,mineral,zinc-oxide,uv-protection", "Skin Health",
                                "ADULT,YOUNG_ADULT,TEEN",
                                "Vegan,Reef-Safe,Paraben-Free", null, "Apply 15 min before sun exposure", true);
                count += seedProduct("Neem & Turmeric Hand Soap (3 Pack)", "neem-turmeric-hand-soap-3pk",
                                "Antibacterial hand soap with traditional herbs.",
                                "Neem Extract, Turmeric, Glycerin, Essential Oils",
                                "Antibacterial, Moisturizing, Natural formula, Skin nourishing", 11.99, null,
                                "HerbClean", personalCare,
                                "hand-soap,neem,turmeric,antibacterial,herbal", "Hygiene", "ADULT,YOUNG_ADULT,TEEN",
                                "Paraben-Free,Sulfate-Free", null, "Use for regular hand washing", false);
                count += seedProduct("Hyaluronic Acid Serum", "hyaluronic-acid-serum",
                                "Hydrating facial serum for plump, youthful skin.",
                                "Hyaluronic Acid 2%, Vitamin C, Niacinamide, Aloe Vera",
                                "Deep hydration, Fine line reduction, Skin plumping, Radiance", 22.99, 18.99,
                                "HydraGlow", personalCare,
                                "hyaluronic-acid,serum,hydration,anti-aging,face", "Skin Health",
                                "ADULT,YOUNG_ADULT,MIDDLE_AGED",
                                "Vegan,Paraben-Free", null, "Apply 3-4 drops to face daily", true);
                count += seedProduct("Bamboo Charcoal Face Mask (10 Pack)", "bamboo-charcoal-face-mask-10pk",
                                "Deep cleansing sheet masks with bamboo charcoal.",
                                "Bamboo Charcoal, Hyaluronic Acid, Green Tea Extract",
                                "Pore cleansing, Oil absorbing, Skin detox, Hydrating", 14.99, null, "MaskPure",
                                personalCare,
                                "face-mask,charcoal,pore-cleansing,sheet-mask,skin", "Skin Health", "ADULT,YOUNG_ADULT",
                                "Vegan,Paraben-Free", null, "Apply mask for 15-20 minutes", false);
                count += seedProduct("Natural Deodorant Stick", "natural-deodorant-stick",
                                "Aluminum-free natural deodorant with essential oils.",
                                "Coconut Oil, Baking Soda, Shea Butter, Lavender Oil",
                                "24-hour protection, No aluminum, Gentle formula, Fresh scent", 8.99, null,
                                "FreshNatural",
                                personalCare, "deodorant,natural,aluminum-free,essential-oils,lavender", "Hygiene",
                                "ADULT,YOUNG_ADULT,TEEN", "Vegan,Aluminum-Free,Paraben-Free", null,
                                "Apply to clean, dry underarms",
                                false);
                count += seedProduct("Keratin Hair Repair Shampoo", "keratin-hair-repair-shampoo",
                                "Strengthening shampoo with keratin and biotin.",
                                "Hydrolyzed Keratin, Biotin, Argan Oil, Panthenol",
                                "Hair strengthening, Damage repair, Shine enhancement, Split end repair", 14.99, null,
                                "HairFix",
                                personalCare, "shampoo,keratin,biotin,hair-repair,argan-oil", "Hair Health",
                                "ADULT,YOUNG_ADULT",
                                "Sulfate-Free,Paraben-Free", null, "Apply to wet hair, lather, rinse", false);
                count += seedProduct("Retinol Night Cream", "retinol-night-cream",
                                "Anti-aging retinol cream for fine lines and wrinkles.",
                                "Retinol 0.5%, Peptides, Squalane, Vitamin E",
                                "Anti-aging, Wrinkle reduction, Skin renewal, Complexion evening", 26.99, 21.99,
                                "AgelessNight",
                                personalCare, "retinol,anti-aging,night-cream,wrinkles,peptides", "Skin Health",
                                "ADULT,MIDDLE_AGED,SENIOR", "Paraben-Free", null, "Apply to face and neck at bedtime",
                                false);

                // ========= MEDICAL DEVICES (40 products) =========
                count += seedProduct("Digital Blood Pressure Monitor", "digital-blood-pressure-monitor",
                                "Automatic arm blood pressure monitor with large display.",
                                "Digital monitor, Arm cuff (22-42cm), Memory for 120 readings, USB charging",
                                "Accurate BP tracking, Irregular heartbeat detection, WHO color indicator", 39.99,
                                32.99, "VitaPress",
                                medicalDevices, "blood-pressure,monitor,digital,heart-health,hypertension",
                                "Heart Health,Diabetes Care", "ADULT,SENIOR,MIDDLE_AGED", "N/A", null,
                                "Measure twice daily, morning and evening", true);
                count += seedProduct("Pulse Oximeter", "pulse-oximeter",
                                "Fingertip pulse oximeter for SpO2 and heart rate.",
                                "OLED display, SpO2 accuracy ±2%, Heart rate, Batteries included",
                                "Blood oxygen monitoring, Heart rate tracking, Quick 10-second results", 24.99, 19.99,
                                "OxiTrack",
                                medicalDevices, "pulse-oximeter,spo2,oxygen,heart-rate,monitor",
                                "Heart Health,Overall Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "N/A", null, "Place finger in device, wait 10 seconds",
                                true);
                count += seedProduct("Digital Thermometer", "digital-thermometer",
                                "Fast-read digital thermometer with fever alert.",
                                "Medical grade sensor, 10-second reading, Fever alarm, Waterproof tip",
                                "Quick temperature check, Fever detection, Memory recall, Accurate to 0.1°F", 9.99,
                                null, "TempCheck",
                                medicalDevices, "thermometer,digital,fever,temperature,medical", "Overall Health",
                                "ADULT,TEEN,YOUNG_ADULT", "N/A", null, "Place under tongue for 10 seconds", false);
                count += seedProduct("Compression Knee Sleeve (Pair)", "compression-knee-sleeve-pair",
                                "Medical-grade compression sleeves for knee support.",
                                "Neoprene, Nylon, Spandex, Breathable mesh",
                                "Joint stabilization, Pain relief, Swelling reduction, Recovery aid", 19.99, 14.99,
                                "KneeGuard",
                                medicalDevices, "knee-sleeve,compression,joint-support,pain-relief,recovery",
                                "Joint Health,Fitness",
                                "ADULT,SENIOR,MIDDLE_AGED", "N/A", "Contains Latex",
                                "Wear during activity or as needed", false);
                count += seedProduct("Heating Pad Electric", "heating-pad-electric",
                                "Extra-large electric heating pad with auto shut-off.",
                                "Soft microfiber, 3 heat settings, Auto shut-off, Machine washable",
                                "Pain relief, Muscle relaxation, Menstrual cramp relief, Back pain", 29.99, 24.99,
                                "WarmRelief",
                                medicalDevices, "heating-pad,pain-relief,muscle,therapy,electric", "Pain Relief",
                                "ADULT,SENIOR,MIDDLE_AGED", "N/A", null, "Apply to affected area, 20 min sessions",
                                false);
                count += seedProduct("Nebulizer Machine Portable", "nebulizer-machine-portable",
                                "Compact mesh nebulizer for respiratory medication delivery.",
                                "Mesh technology, USB rechargeable, Quiet operation, Travel case",
                                "Asthma management, Medication delivery, Portable, Silent operation", 49.99, 39.99,
                                "BreathEasy",
                                medicalDevices, "nebulizer,respiratory,asthma,inhaler,portable", "Respiratory Health",
                                "ADULT,SENIOR,TEEN", "N/A", null, "Use as prescribed by physician", false);
                count += seedProduct("Wrist Blood Pressure Monitor", "wrist-blood-pressure-monitor",
                                "Compact wrist BP monitor for on-the-go monitoring.",
                                "Digital display, 60 memory slots, Carrying case, AAA batteries",
                                "Portable BP tracking, Position guide, Accurate readings", 27.99, null, "WristVita",
                                medicalDevices,
                                "blood-pressure,wrist-monitor,portable,heart-health,digital", "Heart Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "N/A", null,
                                "Measure at heart level, sit still for 5 min before", false);
                count += seedProduct("First Aid Kit Premium (250 Pieces)", "first-aid-kit-premium-250pc",
                                "Comprehensive first aid kit for home and travel.",
                                "Bandages, Antiseptic wipes, Gauze, Scissors, Tape, Pain relievers",
                                "Emergency preparedness, Wound care, Travel safety, Complete kit", 34.99, 29.99,
                                "MediKit+",
                                medicalDevices, "first-aid,emergency,bandage,wound-care,medical-kit", "Overall Health",
                                "ADULT,YOUNG_ADULT", "N/A", null, "Keep accessible for emergencies", false);

                // ========= HEART HEALTH (40 products) =========
                count += seedProduct("Omega-3 Krill Oil 1000mg", "omega3-krill-oil-1000mg",
                                "Premium Antarctic krill oil for superior omega-3 absorption.",
                                "Krill Oil, Astaxanthin, EPA 150mg, DHA 90mg, Phospholipids",
                                "Heart health, Brain function, Joint support, No fishy burps", 32.99, 27.99,
                                "KrillPure", heartHealth,
                                "krill-oil,omega-3,heart-health,astaxanthin,phospholipids", "Heart Health,Brain Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "Gluten-Free", "Contains Shellfish",
                                "2 softgels daily with meals", true);
                count += seedProduct("Garlic Extract Odorless 1000mg", "garlic-extract-odorless-1000mg",
                                "Standardized garlic for cardiovascular and immune support.",
                                "Odorless Garlic Extract (Allium Sativum), Allicin",
                                "Blood pressure support, Cholesterol management, Immune boost, Heart health", 12.99,
                                null,
                                "GarlicGuard", heartHealth, "garlic,heart-health,blood-pressure,cholesterol,immune",
                                "Heart Health,Immunity", "ADULT,SENIOR", "Vegan,Gluten-Free", null,
                                "1 softgel daily with meals",
                                false);
                count += seedProduct("Nattokinase 2000 FU", "nattokinase-2000fu",
                                "Japanese enzyme for healthy blood flow and circulation.",
                                "Nattokinase (from Bacillus subtilis natto)",
                                "Blood circulation, Fibrin support, Cardiovascular health, Blood viscosity", 24.99,
                                null, "FlowNatto",
                                heartHealth, "nattokinase,circulation,blood-flow,heart-health,enzyme", "Heart Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free,Soy-Free", null,
                                "1 capsule daily on empty stomach",
                                false);
                count += seedProduct("Hawthorn Berry Extract 565mg", "hawthorn-berry-extract-565mg",
                                "Traditional herb for heart and blood pressure support.",
                                "Hawthorn Berry, Hawthorn Leaf, Hawthorn Flower Extract",
                                "Heart muscle support, Blood pressure, Antioxidant, Circulation", 14.99, null,
                                "HeartHerb", heartHealth,
                                "hawthorn-berry,heart-health,blood-pressure,antioxidant,herb", "Heart Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null, "1 capsule twice daily", false);
                count += seedProduct("Red Yeast Rice 600mg", "red-yeast-rice-600mg",
                                "Natural support for healthy cholesterol levels.",
                                "Red Yeast Rice (Monascus purpureus), Citrinin-free",
                                "Cholesterol support, Heart health, Lipid metabolism", 18.99, null, "CholestoNorm",
                                heartHealth,
                                "red-yeast-rice,cholesterol,heart-health,lipid,natural", "Heart Health",
                                "ADULT,SENIOR,MIDDLE_AGED",
                                "Vegan,Gluten-Free", null, "1 capsule twice daily with meals", false);

                // ========= IMMUNITY (40 products) =========
                count += seedProduct("Elderberry Gummies", "elderberry-gummies",
                                "Delicious elderberry gummies for immune support.",
                                "Sambucus Elderberry Extract, Vitamin C, Zinc",
                                "Immune support, Cold & flu defense, Antioxidant, Great taste", 18.99, 14.99,
                                "ElderGuard",
                                immunityBoosters, "elderberry,immunity,gummies,vitamin-c,zinc", "Immunity",
                                "ADULT,TEEN,YOUNG_ADULT",
                                "Vegan,Gluten-Free", null, "2 gummies daily", true);
                count += seedProduct("Echinacea Complex 400mg", "echinacea-complex-400mg",
                                "Standardized echinacea for immune defense.",
                                "Echinacea Purpurea, Echinacea Angustifolia, Goldenseal",
                                "Immune stimulation, Cold prevention, Upper respiratory support", 13.99, null,
                                "ImmunoHerb",
                                immunityBoosters, "echinacea,immunity,cold-prevention,herbal,respiratory", "Immunity",
                                "ADULT,SENIOR",
                                "Vegan,Gluten-Free", null, "1 capsule 3 times daily when needed", false);
                count += seedProduct("Mushroom Complex (10 Mushrooms)", "mushroom-complex-10",
                                "Powerful blend of 10 medicinal mushrooms.",
                                "Reishi, Lion's Mane, Chaga, Shiitake, Maitake, Cordyceps, Turkey Tail, Agaricus, Meshima, Tremella",
                                "Immune modulation, Brain support, Energy, Longevity", 27.99, 22.99, "MycoImmune",
                                immunityBoosters,
                                "mushroom,reishi,lion's-mane,chaga,immunity,adaptogen", "Immunity,Brain Health,Energy",
                                "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free,Organic", null, "2 capsules daily",
                                true);
                count += seedProduct("Quercetin + Vitamin C 500mg", "quercetin-vitamin-c-500mg",
                                "Bioflavonoid with Vitamin C for allergy and immune support.",
                                "Quercetin Dihydrate, Vitamin C, Bromelain",
                                "Allergy relief, Immune boost, Antioxidant, Anti-inflammatory", 19.99, null,
                                "AllerGuard",
                                immunityBoosters, "quercetin,vitamin-c,allergy,antioxidant,bioflavonoid",
                                "Immunity,Allergy",
                                "ADULT,SENIOR", "Vegan,Gluten-Free", null, "1 capsule twice daily", false);
                count += seedProduct("Manuka Honey UMF 15+ (250g)", "manuka-honey-umf15-250g",
                                "Premium New Zealand Manuka honey for immune and gut health.",
                                "100% Manuka Honey, UMF 15+ Certified",
                                "Immune support, Wound healing, Sore throat relief, Gut health", 44.99, 39.99,
                                "ManukaGold",
                                immunityBoosters, "manuka-honey,immune,gut-health,wound-healing,antibacterial",
                                "Immunity,Digestive Health", "ADULT,YOUNG_ADULT,TEEN", "Gluten-Free,Raw", null,
                                "1 teaspoon daily or as needed", false);

                // ========= WEIGHT MANAGEMENT (40 products) =========
                count += seedProduct("Green Tea Extract 500mg", "green-tea-extract-500mg",
                                "Standardized EGCG green tea for metabolism boost.",
                                "Green Tea Extract 98% Polyphenols, 50% EGCG, Low Caffeine",
                                "Metabolism boost, Fat oxidation, Antioxidant, Energy", 14.99, 11.99, "MetaGreen",
                                weightManagement,
                                "green-tea,egcg,metabolism,fat-burning,weight-loss", "Weight Loss,Energy",
                                "ADULT,YOUNG_ADULT",
                                "Vegan,Gluten-Free", null, "1 capsule twice daily with meals", true);
                count += seedProduct("Garcinia Cambogia 1600mg", "garcinia-cambogia-1600mg",
                                "Natural HCA extract for appetite control.",
                                "Garcinia Cambogia 60% HCA, Calcium, Potassium",
                                "Appetite suppression, Fat blocker, Serotonin boost, Weight management", 16.99, null,
                                "SlimGarcia",
                                weightManagement, "garcinia-cambogia,hca,appetite,weight-loss,fat-blocker",
                                "Weight Loss",
                                "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free", null, "1 capsule 30 min before meals", false);
                count += seedProduct("Apple Cider Vinegar Gummies", "apple-cider-vinegar-gummies",
                                "Tasty ACV gummies for weight and digestive support.",
                                "Apple Cider Vinegar, Pomegranate, Beet Root, B-Complex",
                                "Weight management, Digestive support, Detox, Energy", 15.99, 12.99, "ACVBites",
                                weightManagement,
                                "apple-cider-vinegar,acv,weight-loss,digestion,gummies", "Weight Loss,Digestive Health",
                                "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free,Organic", null, "2 gummies before meals", true);
                count += seedProduct("Meal Replacement Shake Powder", "meal-replacement-shake-powder",
                                "Complete nutrition shake for healthy weight management.",
                                "Plant Protein, MCT Oil, Fiber, 24 Vitamins & Minerals",
                                "Meal replacement, 200 calories, 20g protein, 5g fiber, Weight loss support", 34.99,
                                29.99, "SlimShake",
                                weightManagement, "meal-replacement,shake,weight-loss,protein,low-calorie",
                                "Weight Loss,Nutrition",
                                "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free,Soy-Free", null, "Replace 1-2 meals daily",
                                false);
                count += seedProduct("Forskolin 250mg", "forskolin-250mg",
                                "Coleus forskohlii root extract for body composition.",
                                "Forskolin 20% (Coleus Forskohlii Root Extract)",
                                "Fat metabolism, Lean body mass, Thermogenesis, Hormone support", 18.99, null,
                                "LeanForce",
                                weightManagement, "forskolin,fat-burning,metabolism,thermogenesis,weight-loss",
                                "Weight Loss",
                                "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free", null, "1 capsule twice daily before meals",
                                false);

                // ========= BONE & JOINT (30 products) =========
                count += seedProduct("Glucosamine Chondroitin MSM", "glucosamine-chondroitin-msm",
                                "Triple-strength formula for complete joint support.",
                                "Glucosamine 1500mg, Chondroitin 1200mg, MSM 1000mg",
                                "Joint flexibility, Cartilage support, Pain relief, Mobility", 24.99, 19.99,
                                "JointFlex", boneJoint,
                                "glucosamine,chondroitin,msm,joint-health,cartilage", "Joint Health",
                                "ADULT,SENIOR,MIDDLE_AGED",
                                "Gluten-Free", "Contains Shellfish", "3 tablets daily with meals", true);
                count += seedProduct("Boswellia Serrata 500mg", "boswellia-serrata-500mg",
                                "Indian frankincense for inflammation and joint relief.",
                                "Boswellia Serrata Extract 65% Boswellic Acids",
                                "Anti-inflammatory, Joint comfort, Mobility support, Pain relief", 17.99, null,
                                "BoswelJoint",
                                boneJoint, "boswellia,anti-inflammatory,joint-health,frankincense,pain", "Joint Health",
                                "ADULT,SENIOR",
                                "Vegan,Gluten-Free", null, "1 capsule twice daily", false);
                count += seedProduct("Hyaluronic Acid 200mg", "hyaluronic-acid-200mg",
                                "Joint lubrication and skin hydration support.",
                                "Hyaluronic Acid (Sodium Hyaluronate), Vegetable Capsule",
                                "Joint lubrication, Skin moisture, Eye comfort, Cartilage health", 19.99, null,
                                "HydraJoint", boneJoint,
                                "hyaluronic-acid,joint-lubrication,skin,hydration,cartilage",
                                "Joint Health,Skin Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null, "1 capsule daily", false);
                count += seedProduct("Vitamin D3 + K2 Combo", "vitamin-d3-k2-combo",
                                "Synergistic combo for optimal calcium utilization in bones.",
                                "Vitamin D3 5000 IU, Vitamin K2 (MK-7) 100mcg",
                                "Bone density, Calcium direction, Heart health, Immune support", 18.99, 14.99,
                                "BoneDuo", boneJoint,
                                "vitamin-d3,vitamin-k2,bone-health,calcium,combo", "Bone Health,Heart Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null,
                                "1 capsule daily with fatty meal", true);
                count += seedProduct("UC-II Collagen 40mg", "uc-ii-collagen-40mg",
                                "Undenatured Type II collagen for joint comfort.",
                                "UC-II Standardized Cartilage (Chicken Sternal)",
                                "Joint comfort, Flexibility, Mobility, Cartilage support", 29.99, null, "CartiFlex",
                                boneJoint,
                                "uc-ii,collagen,joint-comfort,cartilage,mobility", "Joint Health",
                                "ADULT,SENIOR,MIDDLE_AGED",
                                "Gluten-Free", null, "1 capsule daily on empty stomach", false);

                // ========= SKIN & HAIR (30 products) =========
                count += seedProduct("Marine Collagen Peptides", "marine-collagen-peptides",
                                "Wild-caught fish collagen for skin and joint health.",
                                "Hydrolyzed Marine Collagen Type I, Vitamin C, Hyaluronic Acid",
                                "Skin elasticity, Wrinkle reduction, Joint support, Hair strength", 34.99, 29.99,
                                "SeaGlow", skinHair,
                                "marine-collagen,skin-elasticity,anti-aging,fish-collagen,hair",
                                "Skin Health,Hair Health",
                                "ADULT,YOUNG_ADULT,MIDDLE_AGED", "Gluten-Free", "Contains Fish",
                                "1 scoop daily in water", true);
                count += seedProduct("Biotin + Keratin Hair Complex", "biotin-keratin-hair-complex",
                                "Advanced formula for hair growth and strength.",
                                "Biotin 5000mcg, Keratin, Bamboo Extract (Silica), Zinc",
                                "Hair growth, Thickness, Shine, Nail strength", 21.99, 17.99, "HairVita", skinHair,
                                "biotin,keratin,hair-growth,nail-strength,silica", "Hair Health", "ADULT,YOUNG_ADULT",
                                "Gluten-Free",
                                null, "2 capsules daily with meal", true);
                count += seedProduct("Vitamin C Brightening Serum", "vitamin-c-brightening-serum",
                                "20% Vitamin C serum for bright, even skin tone.",
                                "L-Ascorbic Acid 20%, Vitamin E, Ferulic Acid, Hyaluronic Acid",
                                "Brightening, Dark spot reduction, Collagen boost, UV damage repair", 24.99, 19.99,
                                "BrightC", skinHair,
                                "vitamin-c,serum,brightening,dark-spots,anti-aging", "Skin Health",
                                "ADULT,YOUNG_ADULT,MIDDLE_AGED",
                                "Vegan,Paraben-Free", null, "Apply 3-4 drops to face in morning", false);
                count += seedProduct("Hair, Skin & Nails Gummies", "hair-skin-nails-gummies",
                                "Delicious berry gummies with biotin and vitamins.",
                                "Biotin 5000mcg, Vitamin C, Vitamin E, Folic Acid, Zinc",
                                "Hair growth, Skin glow, Nail strength, Great taste", 16.99, null, "GlowBites",
                                skinHair,
                                "hair,skin,nails,gummies,biotin,vitamin-c", "Skin Health,Hair Health",
                                "ADULT,YOUNG_ADULT,TEEN",
                                "Gluten-Free", null, "2 gummies daily", false);
                count += seedProduct("Rosehip Oil Cold-Pressed", "rosehip-oil-cold-pressed",
                                "Organic rosehip seed oil for skin regeneration.",
                                "100% Cold-Pressed Rosa Canina Seed Oil",
                                "Scar reduction, Anti-aging, Hydration, Even skin tone", 14.99, null, "RoseRenew",
                                skinHair,
                                "rosehip-oil,anti-aging,scar,skin-regeneration,organic", "Skin Health",
                                "ADULT,YOUNG_ADULT,MIDDLE_AGED",
                                "Organic,Vegan", null, "Apply 2-3 drops to face at night", false);

                // ========= ADDITIONAL VITAMINS & SUPPLEMENTS =========
                count += seedProduct("Vitamin B Complex", "vitamin-b-complex-50",
                                "Complete formula with all 8 essential B vitamins for energy and metabolism.",
                                "Thiamine, Riboflavin, Niacin, B5, B6, Biotin, Folate, B12",
                                "Energy boost, Nerve support, Metabolism, Mood balance",
                                15.99, 12.99, "BioBalance", supplements, "b-complex,energy,metabolism,vitamins",
                                "Energy,Overall Health", "ADULT,YOUNG_ADULT,SENIOR", "Vegan,Gluten-Free", null,
                                "1 capsule daily with food", true);
                count += seedProduct("Lutein Zeaxanthin Eye Formula", "lutein-zeaxanthin-20mg",
                                "FloraGLO lutein with zeaxanthin for macular health and blue light protection.",
                                "Lutein 20mg, Zeaxanthin 4mg, Vitamin E",
                                "Macular health, Blue light protection, Eye strain relief, Visual acuity",
                                22.99, 18.99, "EyeShield", supplements, "lutein,zeaxanthin,eye-health,macular",
                                "Eye Health", "ADULT,SENIOR,MIDDLE_AGED", "Gluten-Free", null, "1 softgel daily",
                                false);
                count += seedProduct("NAC 600mg Capsules", "nac-600mg-capsules",
                                "N-Acetyl Cysteine for liver support and glutathione production.",
                                "N-Acetyl L-Cysteine 600mg",
                                "Liver detox, Glutathione boost, Respiratory health, Antioxidant",
                                14.99, null, "LiverGuard", supplements, "nac,liver,glutathione,detox,antioxidant",
                                "Overall Health,Immunity", "ADULT,SENIOR", "Vegan,Gluten-Free", null,
                                "1 capsule twice daily", false);
                count += seedProduct("Lions Mane Mushroom 500mg", "lions-mane-500mg",
                                "Organic lions mane extract for cognitive clarity and nerve growth support.",
                                "Hericium Erinaceus Fruiting Body Extract",
                                "Brain clarity, Memory support, Nerve growth factor, Focus enhancement",
                                24.99, 19.99, "NeuroCraft", supplements, "lions-mane,brain,memory,mushroom,focus",
                                "Brain Health,Energy", "ADULT,YOUNG_ADULT,SENIOR", "Vegan,Organic,Gluten-Free", null,
                                "2 capsules daily", true);
                count += seedProduct("Spirulina Organic Tablets", "spirulina-organic-500mg",
                                "Hawaiian spirulina superfood packed with protein, iron, and antioxidants.",
                                "Organic Spirulina Platensis",
                                "Energy, Detoxification, Plant protein source, Iron-rich superfood",
                                16.99, null, "GreenStar", supplements, "spirulina,superfood,energy,detox,green",
                                "Energy,Overall Health", "ADULT,YOUNG_ADULT", "Vegan,Organic,Gluten-Free", null,
                                "3 tablets daily", false);
                count += seedProduct("Melatonin 5mg Sleep Aid", "melatonin-5mg-sleep",
                                "Natural sleep support for faster sleep onset and circadian rhythm reset.",
                                "Melatonin 5mg, Chamomile Extract, L-Theanine",
                                "Faster sleep onset, Better sleep quality, Jet lag relief, Circadian rhythm",
                                8.99, 6.99, "DreamWell", supplements, "melatonin,sleep,insomnia,jet-lag,relaxation",
                                "Sleep", "ADULT,YOUNG_ADULT,SENIOR", "Vegan,Gluten-Free", null,
                                "1 tablet 30 min before bed", true);
                count += seedProduct("L-Theanine 200mg", "l-theanine-200mg-calm",
                                "Green tea amino acid promoting calm focus without drowsiness.",
                                "L-Theanine (Suntheanine) 200mg",
                                "Calm focus, Stress relief, Alpha brain waves, Relaxation without sedation",
                                12.99, null, "ZenFocus", supplements, "l-theanine,focus,calm,stress-relief",
                                "Stress Relief,Brain Health", "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free", null,
                                "1 capsule as needed", false);
                count += seedProduct("Prenatal Multivitamin + DHA", "prenatal-multi-dha",
                                "Complete prenatal formula with DHA omega-3, folate, and iron for mother and baby.",
                                "Folate 800mcg, DHA 200mg, Iron 27mg, Vitamin D3",
                                "Fetal development, Maternal health, Brain development, Energy support",
                                29.99, 24.99, "MamaCare", supplements, "prenatal,dha,folate,pregnancy,iron",
                                "Women's Health,Prenatal", "YOUNG_ADULT,ADULT", "Gluten-Free", "Contains Fish",
                                "1 softgel daily", true);
                count += seedProduct("Chlorella Green Tablets", "chlorella-tablets-500mg",
                                "Broken cell wall chlorella for heavy metal detox and immune boost.",
                                "Organic Chlorella Vulgaris, Broken Cell Wall",
                                "Heavy metal detox, Chlorophyll-rich, Immune support, Digestion aid",
                                18.99, null, "GreenDetox", supplements, "chlorella,detox,superfood,chlorophyll",
                                "Overall Health,Immunity", "ADULT,YOUNG_ADULT", "Vegan,Organic,Gluten-Free", null,
                                "4 tablets daily", false);
                count += seedProduct("Iodine Selenium Thyroid Complex", "iodine-selenium-complex",
                                "Thyroid support formula combining iodine and selenium.",
                                "Iodine 150mcg, Selenium 200mcg, L-Tyrosine",
                                "Thyroid function, Hormone balance, Metabolism support, Energy production",
                                11.99, null, "ThyroPlus", supplements, "iodine,selenium,thyroid,hormones,metabolism",
                                "Thyroid Health,Energy", "ADULT,MIDDLE_AGED,SENIOR", "Vegan,Gluten-Free", null,
                                "1 capsule daily", false);

                // ========= ADDITIONAL DIABETIC CARE =========
                count += seedProduct("Fenugreek Seed Extract 500mg", "fenugreek-seed-500mg",
                                "Traditional herb for healthy blood sugar and insulin response.",
                                "Fenugreek Seed Extract 50% Saponins",
                                "Blood sugar regulation, Insulin sensitivity, Digestive health, Cholesterol support",
                                13.99, null, "GlucoHerb", diabeticCare, "fenugreek,blood-sugar,insulin,herb",
                                "Diabetes Care", "ADULT,SENIOR", "Vegan,Gluten-Free", null, "1 capsule before meals",
                                false);
                count += seedProduct("Blood Sugar Support Complex", "blood-sugar-support-complex",
                                "Multi-herb formula for comprehensive glucose metabolism support.",
                                "Cinnamon, Chromium, Berberine, ALA, Banaba Leaf",
                                "Blood sugar balance, Insulin sensitivity, Carb metabolism, A1C support",
                                27.99, 22.99, "GlucoMax", diabeticCare,
                                "blood-sugar,complex,chromium,berberine,cinnamon", "Diabetes Care",
                                "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null, "2 capsules daily with meals",
                                true);
                count += seedProduct("Diabetic Wound Healing Gel", "diabetic-wound-healing-gel",
                                "Advanced wound care gel with manuka honey for diabetic skin recovery.",
                                "Manuka Honey, Colloidal Silver, Aloe Vera, Vitamin E",
                                "Wound healing, Infection prevention, Skin repair, Diabetic skin care",
                                15.99, null, "WoundCare+", diabeticCare, "wound-care,diabetic,manuka,healing",
                                "Diabetes Care,Skin Health", "ADULT,SENIOR", "Paraben-Free", null,
                                "Apply to clean wound twice daily", false);
                count += seedProduct("Diabetic Bamboo Socks (3 Pack)", "diabetic-bamboo-socks-3pk",
                                "Non-binding bamboo fiber socks designed for sensitive diabetic feet.",
                                "Bamboo Fiber, Spandex, Seamless Toe, Non-elastic top",
                                "Improved circulation, Moisture wicking, Seamless comfort, Antibacterial",
                                16.99, 12.99, "ComfiFoot", diabeticCare, "diabetic,socks,bamboo,circulation,foot-care",
                                "Diabetes Care", "ADULT,SENIOR,MIDDLE_AGED", "N/A", null,
                                "Wear daily, machine washable", false);
                count += seedProduct("Insulin Cooler Travel Case", "insulin-cooler-travel-case",
                                "Medical-grade insulated case for safe insulin temperature storage.",
                                "Insulated Case, Cooling Gel Packs, Temperature Strip",
                                "Temperature control, Travel protection, 24-hr cooling, TSA approved",
                                29.99, null, "DiaCool", diabeticCare, "insulin,cooler,travel,storage,diabetic",
                                "Diabetes Care", "ADULT,SENIOR,MIDDLE_AGED", "N/A", null,
                                "Activate gel packs before travel", false);
                count += seedProduct("Diabetic Nerve Support Formula", "diabetic-nerve-support",
                                "B-vitamins and ALA combination for diabetic neuropathy support.",
                                "B1, B6, B12, Alpha Lipoic Acid, Acetyl L-Carnitine",
                                "Nerve health, Tingling relief, Circulation, Energy support",
                                23.99, 18.99, "NerveGuard", diabeticCare, "nerve,neuropathy,b-vitamins,ala,diabetic",
                                "Diabetes Care,Energy", "ADULT,SENIOR,MIDDLE_AGED", "Gluten-Free", null,
                                "2 capsules daily", true);
                count += seedProduct("Low GI Protein Bars (12 Pack)", "low-gi-protein-bars-12pk",
                                "Low glycemic protein bars with nuts and dark chocolate for diabetics.",
                                "Pea Protein, Almonds, Dark Chocolate 85%, Stevia",
                                "Stable blood sugar, 18g protein, Low GI, Sustained energy",
                                34.99, 29.99, "GlyceBar", diabeticCare, "protein-bar,low-gi,diabetic,snack",
                                "Diabetes Care,Fitness", "ADULT,YOUNG_ADULT", "Gluten-Free", "Contains Nuts",
                                "1-2 bars daily as snack", false);
                count += seedProduct("Diabetic Eye Health Formula", "diabetic-eye-health",
                                "Targeted eye support with lutein and bilberry for diabetic retinal care.",
                                "Lutein, Bilberry, Zinc, Vitamin A, Chromium",
                                "Retina protection, Vision support, Macular health, Blood sugar balance",
                                21.99, null, "DiaEye", diabeticCare, "eye-health,diabetic,lutein,bilberry,vision",
                                "Diabetes Care,Eye Health", "ADULT,SENIOR,MIDDLE_AGED", "Gluten-Free", null,
                                "1 capsule daily", false);
                count += seedProduct("Glucose Tablets Orange (50ct)", "glucose-tablets-orange-50ct",
                                "Fast-acting dextrose tablets for low blood sugar emergencies.",
                                "Dextrose 4g per tablet, Natural Orange Flavor",
                                "Rapid glucose boost, Hypoglycemia relief, Portable, Fast-dissolving",
                                6.99, null, "QuickGlu", diabeticCare, "glucose,tablets,hypoglycemia,emergency",
                                "Diabetes Care", "ADULT,SENIOR,YOUNG_ADULT", "Gluten-Free", null,
                                "Chew 3-4 tablets when needed", false);
                count += seedProduct("Diabetic Fiber Supplement", "diabetic-fiber-supplement",
                                "Psyllium husk fiber to slow glucose absorption after meals.",
                                "Organic Psyllium Husk 500mg, Chromium Picolinate",
                                "Glucose absorption control, Fiber boost, Digestive health, Satiety",
                                12.99, null, "FiberGlu", diabeticCare, "psyllium,fiber,blood-sugar,digestive",
                                "Diabetes Care,Digestive Health", "ADULT,SENIOR", "Vegan,Organic,Gluten-Free", null,
                                "2 capsules before meals", false);

                // ========= ADDITIONAL FITNESS NUTRITION =========
                count += seedProduct("Beta-Alanine 3200mg", "beta-alanine-3200mg",
                                "Sustained-release beta-alanine for endurance and reduced muscle fatigue.",
                                "Beta-Alanine (CarnoSyn) 3200mg",
                                "Endurance, Reduced muscle fatigue, Buffered lactic acid, Performance",
                                17.99, 13.99, "EndurMax", fitness, "beta-alanine,endurance,carnosyn,fatigue",
                                "Fitness,Energy", "YOUNG_ADULT,ADULT", "Vegan,Gluten-Free", null,
                                "2 tablets pre-workout", true);
                count += seedProduct("Citrulline Malate 6g Powder", "citrulline-malate-6g",
                                "L-Citrulline malate for nitric oxide production and muscle pumps.",
                                "L-Citrulline DL-Malate 2:1", "Nitric oxide boost, Muscle pumps, Blood flow, Recovery",
                                21.99, null, "PumpMax", fitness, "citrulline,nitric-oxide,pump,blood-flow", "Fitness",
                                "YOUNG_ADULT,ADULT", "Vegan,Gluten-Free", null, "1 scoop pre-workout", false);
                count += seedProduct("Casein Protein 2lb Chocolate", "casein-protein-2lb",
                                "Slow-release micellar casein for overnight muscle recovery.",
                                "Micellar Casein, Cocoa, Natural Flavors",
                                "Slow-release protein, Overnight recovery, 24g protein, Anti-catabolic",
                                36.99, 31.99, "NightMuscle", fitness, "casein,protein,slow-release,overnight,recovery",
                                "Fitness,Recovery", "YOUNG_ADULT,ADULT", "Gluten-Free", "Contains Dairy",
                                "1 scoop before bed", false);
                count += seedProduct("Energy Gel Packets (24 Pack)", "energy-gel-24pk",
                                "Quick energy gels with electrolytes for marathons and endurance sports.",
                                "Maltodextrin, Sodium, Potassium, Caffeine 25mg, B-Vitamins",
                                "Quick energy, Electrolyte replenishment, Endurance, Easy digestion",
                                27.99, null, "RunFuel", fitness, "energy-gel,endurance,marathon,electrolytes",
                                "Fitness,Energy", "YOUNG_ADULT,ADULT", "Vegan,Gluten-Free", null,
                                "1 gel every 45min during exercise", false);
                count += seedProduct("ZMA Sleep Recovery Complex", "zma-sleep-recovery",
                                "Zinc, magnesium, and B6 for deep sleep and testosterone support.",
                                "Zinc 30mg, Magnesium Aspartate 450mg, Vitamin B6 10.5mg",
                                "Deep sleep, Muscle recovery, Testosterone support, Immune boost",
                                14.99, 11.99, "SleepGains", fitness, "zma,zinc,magnesium,sleep,testosterone",
                                "Fitness,Sleep,Recovery", "YOUNG_ADULT,ADULT", "Gluten-Free", null,
                                "3 capsules 30min before bed", true);
                count += seedProduct("HMB 1000mg Capsules", "hmb-1000mg-capsules",
                                "Beta-Hydroxy Beta-Methylbutyrate for lean muscle preservation.",
                                "Calcium HMB 1000mg", "Lean muscle preservation, Anti-catabolic, Strength, Recovery",
                                19.99, null, "LeanHMB", fitness, "hmb,lean-muscle,anti-catabolic,strength",
                                "Fitness,Muscle Building", "YOUNG_ADULT,ADULT", "Vegan,Gluten-Free", null,
                                "1 capsule 3 times daily", false);
                count += seedProduct("Protein Cookies Box (12 Pack)", "protein-cookies-12pk",
                                "High-protein cookies with 16g protein and only 2g sugar each.",
                                "Whey Protein, Almond Flour, Dark Chocolate Chips, Stevia",
                                "16g protein, Low sugar, Tasty snack, Sustained energy",
                                24.99, 19.99, "ProteinBite", fitness, "protein-cookie,snack,high-protein,low-sugar",
                                "Fitness", "YOUNG_ADULT,ADULT,TEEN", "Gluten-Free", "Contains Dairy,Contains Nuts",
                                "1-2 cookies as snack", false);
                count += seedProduct("Athletic Greens Superfood Powder", "athletic-greens-superfood",
                                "75 ingredient superfood blend for daily nutrition and gut health.",
                                "Spirulina, Chlorella, Ashwagandha, Probiotics, Enzymes",
                                "Nutrient coverage, Gut health, Energy, Immunity boost",
                                69.99, 59.99, "AthleticG", fitness, "greens,superfood,nutrition,gut-health",
                                "Overall Health,Fitness,Energy", "YOUNG_ADULT,ADULT", "Vegan,Gluten-Free", null,
                                "1 scoop daily in water", true);
                count += seedProduct("Testosterone Support Complex", "testosterone-support-complex",
                                "Natural testosterone booster with ashwagandha and fenugreek.",
                                "Ashwagandha, Fenugreek, D-Aspartic Acid, Zinc, Vitamin D",
                                "Testosterone support, Strength, Vitality, Muscle mass",
                                29.99, null, "TestoMax", fitness, "testosterone,ashwagandha,fenugreek,vitality",
                                "Fitness,Energy", "YOUNG_ADULT,ADULT", "Gluten-Free", null, "2 capsules daily", false);
                count += seedProduct("Foam Roller Set with Bands", "foam-roller-set",
                                "High-density foam roller with resistance bands and massage ball.",
                                "EVA foam roller, 3 resistance bands, Lacrosse ball, Carry bag",
                                "Muscle recovery, Myofascial release, Flexibility, Pain relief",
                                24.99, 19.99, "RollRecover", fitness, "foam-roller,recovery,massage,flexibility",
                                "Fitness,Recovery", "YOUNG_ADULT,ADULT,TEEN", "N/A", null, "Use pre and post workout",
                                false);

                // ========= ADDITIONAL PERSONAL CARE =========
                count += seedProduct("Coconut Oil Pulling Mouthwash", "coconut-oil-pulling-mouthwash",
                                "Organic coconut oil mouthwash with peppermint for oral detox.",
                                "Organic Coconut Oil, Peppermint Oil, Tea Tree Oil",
                                "Oral detox, Fresh breath, Gum health, Teeth whitening",
                                11.99, null, "PureMouth", personalCare, "oil-pulling,coconut,mouthwash,oral-care",
                                "Oral Health", "ADULT,YOUNG_ADULT", "Vegan,Organic", null,
                                "Swish 1 tbsp for 10-15 minutes daily", false);
                count += seedProduct("Vitamin E Body Lotion 500ml", "vitamin-e-body-lotion-500ml",
                                "Deep moisturizing body lotion with vitamin E and shea butter.",
                                "Vitamin E, Shea Butter, Aloe Vera, Jojoba Oil",
                                "Deep moisturizing, Skin softening, Scar reduction, Anti-aging",
                                13.99, null, "SilkSkin", personalCare, "body-lotion,vitamin-e,moisturizer,shea-butter",
                                "Skin Health", "ADULT,YOUNG_ADULT", "Paraben-Free,Sulfate-Free", null,
                                "Apply to body after shower", false);
                count += seedProduct("Anti-Dandruff Zinc Shampoo", "anti-dandruff-zinc-shampoo",
                                "Zinc pyrithione shampoo for flake-free scalp health.",
                                "Zinc Pyrithione 1%, Tea Tree Oil, Aloe Vera, Biotin",
                                "Dandruff control, Scalp health, Hair strength, Itch relief",
                                12.99, 9.99, "ScalpClear", personalCare, "anti-dandruff,zinc,shampoo,scalp,hair",
                                "Hair Health", "ADULT,YOUNG_ADULT,TEEN", "Sulfate-Free,Paraben-Free", null,
                                "Use 3 times per week", true);
                count += seedProduct("SPF 30 Lip Balm (3 Pack)", "spf30-lip-balm-3pk",
                                "Moisturizing lip balm with SPF 30 sun protection in 3 flavors.",
                                "Beeswax, Coconut Oil, Vitamin E, Zinc Oxide SPF 30",
                                "Sun protection, Lip moisturizing, Crack prevention, Multiple flavors",
                                8.99, null, "LipShield", personalCare, "lip-balm,spf30,sun-protection,moisturizer",
                                "Skin Health", "ADULT,YOUNG_ADULT,TEEN", "Paraben-Free", null,
                                "Apply as needed before sun exposure", false);
                count += seedProduct("Argan Oil Hair Serum", "argan-oil-hair-serum",
                                "Pure Moroccan argan oil serum for frizz control and hair shine.",
                                "100% Cold-Pressed Argan Oil, Vitamin E",
                                "Frizz control, Hair shine, Heat protection, Split end repair",
                                16.99, 13.99, "ArganGlow", personalCare, "argan-oil,hair-serum,frizz,shine,moroccan",
                                "Hair Health", "ADULT,YOUNG_ADULT", "Vegan,Paraben-Free", null,
                                "Apply 2-3 drops to damp hair", false);
                count += seedProduct("Coffee Body Scrub 300g", "coffee-body-scrub-300g",
                                "Exfoliating coffee scrub with coconut oil for smooth skin.",
                                "Arabica Coffee Grounds, Coconut Oil, Sea Salt, Vitamin E",
                                "Exfoliation, Cellulite reduction, Smooth skin, Energizing aroma",
                                14.99, null, "CafeScrub", personalCare, "body-scrub,coffee,exfoliant,coconut-oil",
                                "Skin Health", "ADULT,YOUNG_ADULT", "Vegan,Paraben-Free", null,
                                "Massage onto wet skin, rinse", false);
                count += seedProduct("Anti-Wrinkle Eye Cream", "anti-wrinkle-eye-cream",
                                "Peptide-rich eye cream for dark circles, puffiness, and crow's feet.",
                                "Peptides, Caffeine, Hyaluronic Acid, Vitamin K",
                                "Dark circle reduction, Puffiness relief, Fine line smoothing, Firmness",
                                24.99, 19.99, "BrightEye", personalCare, "eye-cream,anti-wrinkle,peptides,dark-circles",
                                "Skin Health", "ADULT,MIDDLE_AGED,SENIOR", "Paraben-Free", null,
                                "Dab around eye area morning and night", true);
                count += seedProduct("Men's Face Moisturizer SPF 30", "mens-face-moisturizer-spf30",
                                "Lightweight daily moisturizer with SPF for men's skin.",
                                "Niacinamide, Hyaluronic Acid, Zinc Oxide SPF 30, Caffeine",
                                "UV protection, Oil control, Hydration, Anti-aging",
                                18.99, null, "AlphaFace", personalCare, "mens,moisturizer,spf30,niacinamide,face",
                                "Skin Health", "ADULT,YOUNG_ADULT", "Paraben-Free,Sulfate-Free", null,
                                "Apply to clean face every morning", false);
                count += seedProduct("Organic Baby Wash & Shampoo", "organic-baby-wash-shampoo",
                                "Gentle plant-based wash and shampoo for sensitive baby skin.",
                                "Organic Chamomile, Calendula, Coconut-derived Cleansers",
                                "Gentle cleansing, Tear-free, Hypoallergenic, Soothing",
                                10.99, null, "TinyPure", personalCare, "baby-wash,organic,gentle,hypoallergenic",
                                "Skin Health", "ADULT,YOUNG_ADULT", "Organic,Vegan,Paraben-Free", null,
                                "Use at bath time", false);
                count += seedProduct("Charcoal Peel-Off Face Mask (8pk)", "charcoal-peel-off-mask-8pk",
                                "Activated charcoal peel-off masks for deep pore cleansing.",
                                "Activated Charcoal, Aloe Vera, Tea Tree Extract",
                                "Deep pore cleansing, Blackhead removal, Oil control, Skin detox",
                                13.99, null, "PeelPure", personalCare, "face-mask,charcoal,peel-off,pore-cleansing",
                                "Skin Health", "ADULT,YOUNG_ADULT,TEEN", "Vegan,Paraben-Free", null,
                                "Apply, wait 20 min, peel off", false);

                // ========= ADDITIONAL MEDICAL DEVICES =========
                count += seedProduct("TENS Unit Muscle Stimulator", "tens-unit-muscle-stimulator",
                                "FDA-cleared TENS device with 24 modes for pain management.",
                                "TENS unit, 8 electrode pads, USB charging, Carrying case",
                                "Pain relief, Muscle stimulation, 24 modes, Portable therapy",
                                34.99, 27.99, "PainFree", medicalDevices, "tens,pain-relief,muscle-stimulator,therapy",
                                "Pain Relief", "ADULT,SENIOR,MIDDLE_AGED", "N/A", null,
                                "Use 20-30 min sessions as needed", true);
                count += seedProduct("Weekly Pill Organizer Premium", "weekly-pill-organizer-premium",
                                "Large 7-day pill organizer with AM/PM compartments and travel case.",
                                "BPA-free plastic, 14 compartments, Carrying case",
                                "Medication management, AM/PM dosing, Travel-friendly, Easy-open lids",
                                9.99, null, "PillSafe", medicalDevices, "pill-organizer,weekly,medication,travel",
                                "Overall Health", "ADULT,SENIOR,MIDDLE_AGED", "N/A", null,
                                "Fill weekly, take as scheduled", false);
                count += seedProduct("Orthopaedic Memory Foam Pillow", "memory-foam-pillow-ortho",
                                "Contoured cervical pillow for neck pain relief and better sleep.",
                                "Memory foam, Bamboo cover, Cooling gel layer",
                                "Neck alignment, Pain relief, Better sleep, Hypoallergenic",
                                29.99, 24.99, "SleepAlign", medicalDevices,
                                "pillow,memory-foam,neck-pain,orthopaedic,sleep", "Sleep,Pain Relief",
                                "ADULT,SENIOR,MIDDLE_AGED", "N/A", null, "Use nightly for proper neck support", false);
                count += seedProduct("Lumbar Back Brace Support", "lumbar-back-brace",
                                "Adjustable lumbar support belt for lower back pain relief.",
                                "Breathable mesh, Steel support stays, Velcro closure",
                                "Lower back support, Pain relief, Posture correction, Activity support",
                                24.99, 19.99, "BackGuard", medicalDevices,
                                "back-brace,lumbar,support,pain-relief,posture", "Pain Relief,Joint Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "N/A", "Contains Latex", "Wear during physical activity",
                                false);
                count += seedProduct("Ankle Brace Compression Wrap", "ankle-brace-compression",
                                "Medical-grade ankle brace for sprains and chronic instability.",
                                "Neoprene, Nylon, Adjustable straps, Breathable design",
                                "Ankle stabilization, Sprain recovery, Swelling reduction, Compression",
                                14.99, null, "AnkleGuard", medicalDevices,
                                "ankle-brace,compression,sprain,support,recovery", "Joint Health,Fitness",
                                "ADULT,YOUNG_ADULT", "N/A", null, "Wear during activity as needed", false);
                count += seedProduct("Fitness Tracker Health Watch", "fitness-tracker-health-watch",
                                "Smart fitness tracker with heart rate, SpO2, sleep, and step tracking.",
                                "AMOLED display, Heart rate sensor, SpO2, 7-day battery",
                                "Heart rate tracking, Sleep analysis, Step counting, SpO2 monitoring",
                                49.99, 39.99, "FitTrack", medicalDevices, "fitness-tracker,heart-rate,spo2,watch,sleep",
                                "Heart Health,Fitness,Sleep", "YOUNG_ADULT,ADULT", "N/A", null,
                                "Wear daily, charge weekly", true);
                count += seedProduct("Medical Alert ID Bracelet", "medical-alert-bracelet",
                                "Stainless steel medical alert bracelet with engraving for emergencies.",
                                "Stainless steel, Adjustable clasp, Emergency info card",
                                "Emergency identification, Medical info display, Durable, Waterproof",
                                19.99, null, "AlertSafe", medicalDevices,
                                "medical-alert,bracelet,emergency,identification", "Overall Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "N/A", null, "Wear at all times", false);
                count += seedProduct("Portable Massage Gun", "portable-massage-gun",
                                "Percussion massage gun with 6 heads for deep tissue recovery.",
                                "Brushless motor, 6 massage heads, 30 speeds, 6hr battery",
                                "Deep tissue massage, Muscle recovery, Pain relief, Portable",
                                59.99, 49.99, "MassagePro", medicalDevices,
                                "massage-gun,percussion,recovery,deep-tissue", "Fitness,Pain Relief,Recovery",
                                "YOUNG_ADULT,ADULT", "N/A", null, "Use 1-2 min per muscle group", true);
                count += seedProduct("Magnifying LED Reading Lamp", "magnifying-led-lamp",
                                "Desktop magnifying lamp with LED for reading and crafts with low vision.",
                                "3x/5x magnification, LED ring light, Flexible arm, USB powered",
                                "Visual aid, Magnification, Natural light, Eye strain reduction",
                                22.99, null, "ClearView", medicalDevices, "magnifying,lamp,led,reading,low-vision",
                                "Eye Health", "SENIOR,MIDDLE_AGED", "N/A", null, "Place over reading material", false);
                count += seedProduct("Digital Hearing Amplifier (Pair)", "digital-hearing-amplifier",
                                "Discreet rechargeable hearing amplifier with noise reduction.",
                                "Rechargeable battery, 3 earpiece sizes, Noise reduction",
                                "Sound amplification, Noise filtering, Comfortable fit, Rechargeable",
                                79.99, 64.99, "HearClear", medicalDevices, "hearing,amplifier,digital,rechargeable",
                                "Overall Health", "SENIOR,MIDDLE_AGED", "N/A", null,
                                "Wear during conversations, charge nightly", false);

                // ========= ADDITIONAL HEART & CARDIOVASCULAR =========
                count += seedProduct("Plant Sterols 1000mg", "plant-sterols-1000mg",
                                "Clinically proven plant sterols for cholesterol management.",
                                "Plant Sterols (Beta-Sitosterol, Campesterol, Stigmasterol)",
                                "Cholesterol reduction, LDL lowering, Heart health, Lipid balance",
                                22.99, 18.99, "SterolGuard", heartHealth, "plant-sterols,cholesterol,ldl,heart-health",
                                "Heart Health", "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null,
                                "2 tablets daily with meals", true);
                count += seedProduct("L-Arginine 1000mg", "l-arginine-1000mg",
                                "Nitric oxide precursor for blood flow and cardiovascular support.",
                                "L-Arginine HCL 1000mg",
                                "Nitric oxide production, Blood flow, Blood pressure support, Exercise performance",
                                16.99, null, "FlowArg", heartHealth,
                                "l-arginine,nitric-oxide,blood-flow,blood-pressure", "Heart Health,Fitness",
                                "ADULT,MIDDLE_AGED,SENIOR", "Vegan,Gluten-Free", null, "1 tablet twice daily", false);
                count += seedProduct("Grape Seed Extract 300mg", "grape-seed-extract-300mg",
                                "Potent antioxidant for vascular health and blood pressure support.",
                                "Grape Seed Extract 95% Proanthocyanidins",
                                "Antioxidant, Vascular health, Blood pressure, Collagen protection",
                                14.99, null, "VineGuard", heartHealth, "grape-seed,antioxidant,vascular,blood-pressure",
                                "Heart Health,Skin Health", "ADULT,SENIOR", "Vegan,Gluten-Free", null,
                                "1 capsule daily", false);
                count += seedProduct("Magnesium Taurate 400mg", "magnesium-taurate-400mg",
                                "Heart-specific magnesium for cardiovascular rhythm support.",
                                "Magnesium Taurate 400mg", "Heart rhythm, Blood pressure, Vascular health, Relaxation",
                                18.99, null, "HeartMag", heartHealth, "magnesium,taurate,heart-rhythm,blood-pressure",
                                "Heart Health", "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null,
                                "1 capsule twice daily", false);
                count += seedProduct("Resveratrol 500mg", "resveratrol-500mg",
                                "Trans-resveratrol from Japanese knotweed for longevity and heart health.",
                                "Trans-Resveratrol 500mg (Japanese Knotweed)",
                                "Anti-aging, Heart protection, Antioxidant, Cellular health",
                                27.99, 22.99, "LongVine", heartHealth,
                                "resveratrol,anti-aging,heart-health,antioxidant", "Heart Health,Overall Health",
                                "ADULT,MIDDLE_AGED,SENIOR", "Vegan,Gluten-Free", null, "1 capsule daily", true);
                count += seedProduct("Organic Beetroot Powder", "organic-beetroot-powder",
                                "Nitrate-rich organic beetroot for blood flow and exercise performance.",
                                "Organic Beta Vulgaris Root Powder",
                                "Nitric oxide, Blood pressure, Exercise performance, Stamina",
                                19.99, null, "BeetFlow", heartHealth, "beetroot,nitric-oxide,blood-pressure,stamina",
                                "Heart Health,Fitness", "ADULT,YOUNG_ADULT", "Vegan,Organic,Gluten-Free", null,
                                "1 scoop daily in water", false);
                count += seedProduct("Pomegranate Extract 500mg", "pomegranate-extract-500mg",
                                "Standardized pomegranate for arterial health and antioxidant protection.",
                                "Pomegranate Fruit Extract 40% Ellagic Acid",
                                "Arterial health, Antioxidant, Blood pressure, Anti-inflammatory",
                                17.99, null, "PomGuard", heartHealth, "pomegranate,arterial,antioxidant,blood-pressure",
                                "Heart Health", "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null,
                                "1 capsule daily", false);
                count += seedProduct("Flaxseed Oil 1000mg Softgels", "flaxseed-oil-1000mg",
                                "Cold-pressed organic flaxseed oil rich in ALA omega-3.",
                                "Organic Flaxseed Oil, ALA 550mg per softgel",
                                "Plant-based omega-3, Heart health, Inflammation, Skin health",
                                12.99, null, "FlaxHeart", heartHealth, "flaxseed,omega-3,ala,plant-based,heart",
                                "Heart Health,Skin Health", "ADULT,SENIOR", "Vegan,Organic,Gluten-Free", null,
                                "2 softgels daily", false);
                count += seedProduct("Cayenne Pepper Capsules 450mg", "cayenne-pepper-capsules-450mg",
                                "Capsaicin-rich cayenne for circulation and metabolic boost.",
                                "Cayenne Pepper 40,000 HU, Ginger Root",
                                "Circulation, Metabolism boost, Digestive fire, Pain relief",
                                9.99, null, "HeatFlow", heartHealth, "cayenne,capsaicin,circulation,metabolism",
                                "Heart Health,Weight Loss", "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free", null,
                                "1 capsule with meals", false);
                count += seedProduct("Potassium Citrate 99mg", "potassium-citrate-99mg",
                                "Essential potassium for heart rhythm and blood pressure support.",
                                "Potassium Citrate 99mg",
                                "Heart rhythm, Blood pressure, Muscle function, Electrolyte balance",
                                8.99, null, "KGuard", heartHealth, "potassium,heart-rhythm,blood-pressure,electrolyte",
                                "Heart Health", "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null,
                                "1 tablet daily with food", false);

                // ========= ADDITIONAL IMMUNITY BOOSTERS =========
                count += seedProduct("Oregano Oil Capsules 150mg", "oregano-oil-capsules-150mg",
                                "Wild Mediterranean oregano oil for powerful immune and antimicrobial support.",
                                "Wild Oregano Oil (Origanum Vulgare), Carvacrol 70%",
                                "Antimicrobial, Immune boost, Respiratory support, Antioxidant",
                                17.99, null, "OreganoShield", immunityBoosters,
                                "oregano-oil,antimicrobial,immune,carvacrol", "Immunity", "ADULT,SENIOR",
                                "Vegan,Gluten-Free", null, "1 softgel daily with food", false);
                count += seedProduct("Bee Propolis Extract 500mg", "bee-propolis-extract-500mg",
                                "Natural bee propolis for immune defense and throat health.",
                                "Bee Propolis Extract, Bioflavonoids",
                                "Immune defense, Throat soothing, Antioxidant, Natural antibiotic",
                                15.99, 12.99, "PropolisGuard", immunityBoosters,
                                "propolis,bee,immunity,throat,antioxidant", "Immunity", "ADULT,YOUNG_ADULT",
                                "Gluten-Free", "Contains Bee Products", "1 capsule twice daily", false);
                count += seedProduct("Astragalus Root 500mg", "astragalus-root-500mg",
                                "Traditional Chinese herb for immune strengthening and vitality.",
                                "Astragalus Membranaceus Root Extract 4:1",
                                "Immune boost, Energy, Longevity, Adaptogenic support",
                                13.99, null, "ImmunoRoot", immunityBoosters,
                                "astragalus,immune,adaptogen,energy,chinese-herb", "Immunity,Energy", "ADULT,SENIOR",
                                "Vegan,Gluten-Free", null, "1 capsule twice daily", false);
                count += seedProduct("Black Seed Oil 500mg", "black-seed-oil-500mg",
                                "Nigella sativa cold-pressed oil for comprehensive immune support.",
                                "Cold-Pressed Nigella Sativa Oil, Thymoquinone 2%",
                                "Immune modulation, Anti-inflammatory, Respiratory, Antioxidant",
                                19.99, 15.99, "BlackCure", immunityBoosters, "black-seed,nigella,immune,thymoquinone",
                                "Immunity", "ADULT,SENIOR", "Vegan,Gluten-Free", null, "1 softgel twice daily", true);
                count += seedProduct("Olive Leaf Extract 500mg", "olive-leaf-extract-500mg",
                                "Standardized olive leaf for immune and cardiovascular support.",
                                "Olive Leaf Extract 20% Oleuropein",
                                "Immune support, Antioxidant, Cardiovascular, Blood pressure",
                                14.99, null, "OliveGuard", immunityBoosters, "olive-leaf,oleuropein,immune,antioxidant",
                                "Immunity,Heart Health", "ADULT,SENIOR", "Vegan,Gluten-Free", null,
                                "1 capsule twice daily", false);
                count += seedProduct("Andrographis 400mg", "andrographis-400mg",
                                "King of bitters herb for cold and flu immune defense.",
                                "Andrographis Paniculata 10% Andrographolides",
                                "Cold and flu defense, Immune stimulation, Upper respiratory, Fever support",
                                12.99, null, "ColdShield", immunityBoosters, "andrographis,cold,flu,immune,respiratory",
                                "Immunity", "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free", null,
                                "2 capsules daily when needed", false);
                count += seedProduct("Immune Support Drink Mix (30pk)", "immune-support-drink-mix-30pk",
                                "Vitamin C, zinc, and elderberry daily immune drink packets.",
                                "Vitamin C 1000mg, Zinc 15mg, Elderberry, Echinacea",
                                "Daily immune support, Convenient packets, Great taste, Antioxidant",
                                19.99, 16.99, "ImmunoFizz", immunityBoosters,
                                "immune,drink-mix,vitamin-c,zinc,elderberry", "Immunity", "ADULT,YOUNG_ADULT,TEEN",
                                "Vegan,Gluten-Free", null, "1 packet in water daily", true);
                count += seedProduct("Vitamin C + Zinc Lozenges (60ct)", "vitamin-c-zinc-lozenges-60ct",
                                "Throat-soothing lozenges with vitamin C and zinc for immune support.",
                                "Vitamin C 100mg, Zinc 5mg, Honey, Lemon",
                                "Throat soothing, Immune boost, Cold relief, Pleasant taste",
                                10.99, null, "ThroatGuard", immunityBoosters, "vitamin-c,zinc,lozenges,throat,cold",
                                "Immunity", "ADULT,YOUNG_ADULT,TEEN", "Gluten-Free", null,
                                "Dissolve 1 lozenge as needed", false);
                count += seedProduct("Colostrum 500mg Capsules", "colostrum-500mg",
                                "Bovine colostrum for immune factors and gut lining support.",
                                "Bovine Colostrum 30% IgG",
                                "Immune factors, Gut lining repair, Growth factors, Athletic recovery",
                                26.99, null, "ImmunoFirst", immunityBoosters,
                                "colostrum,immune,gut-health,igg,recovery", "Immunity,Digestive Health",
                                "ADULT,YOUNG_ADULT", "Gluten-Free", "Contains Dairy", "2 capsules on empty stomach",
                                false);
                count += seedProduct("Cat's Claw Bark 500mg", "cats-claw-500mg",
                                "Amazon rainforest herb for immune modulation and joint comfort.",
                                "Uncaria Tomentosa Bark Extract",
                                "Immune modulation, Anti-inflammatory, Joint comfort, DNA repair",
                                11.99, null, "JungleShield", immunityBoosters,
                                "cats-claw,immune,anti-inflammatory,amazonian", "Immunity,Joint Health", "ADULT,SENIOR",
                                "Vegan,Gluten-Free", null, "1 capsule twice daily", false);

                // ========= ADDITIONAL WEIGHT MANAGEMENT =========
                count += seedProduct("MCT Oil Powder Unflavored", "mct-oil-powder",
                                "Medium chain triglycerides powder for keto energy and fat burning.",
                                "C8/C10 MCT Oil, Acacia Fiber",
                                "Ketone boost, Fat burning, Mental clarity, Sustained energy",
                                24.99, 19.99, "KetoFuel", weightManagement, "mct-oil,keto,fat-burning,energy,ketones",
                                "Weight Loss,Energy", "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free,Dairy-Free", null,
                                "1 scoop in coffee or smoothie", true);
                count += seedProduct("Konjac Root Glucomannan", "konjac-root-glucomannan-1000mg",
                                "Natural fiber from konjac root for appetite control and satiety.",
                                "Glucomannan 1000mg (Amorphophallus Konjac)",
                                "Appetite control, Fiber boost, Satiety, Cholesterol support",
                                13.99, null, "FiberFull", weightManagement, "glucomannan,konjac,appetite,fiber,satiety",
                                "Weight Loss,Digestive Health", "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free", null,
                                "2 capsules with water before meals", false);
                count += seedProduct("African Mango Extract 300mg", "african-mango-extract-300mg",
                                "Irvingia gabonensis seed extract for metabolism and leptin support.",
                                "African Mango Seed Extract (IGOB131)",
                                "Metabolism boost, Leptin sensitivity, Fat reduction, Appetite control",
                                17.99, null, "MangoSlim", weightManagement,
                                "african-mango,metabolism,leptin,weight-loss", "Weight Loss", "ADULT,YOUNG_ADULT",
                                "Vegan,Gluten-Free", null, "1 capsule before meals", false);
                count += seedProduct("White Kidney Bean Extract", "white-kidney-bean-extract",
                                "Natural carb and starch blocker from Phaseolus vulgaris.",
                                "White Kidney Bean Extract 1000mg (Phase 2)",
                                "Carb blocking, Starch reduction, Weight management, Blood sugar",
                                14.99, 11.99, "CarbBlock", weightManagement,
                                "carb-blocker,white-kidney-bean,starch,weight-loss", "Weight Loss,Diabetes Care",
                                "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free", null, "1 capsule before carb-heavy meals",
                                false);
                count += seedProduct("Detox Tea Blend (30 Tea Bags)", "detox-tea-blend-30bags",
                                "Organic herbal detox tea with dandelion, ginger, and turmeric.",
                                "Dandelion Root, Ginger, Turmeric, Lemongrass, Green Tea",
                                "Detoxification, Bloating relief, Digestion, Gentle cleanse",
                                15.99, null, "PureTea", weightManagement, "detox-tea,herbal,dandelion,cleanse,bloating",
                                "Weight Loss,Digestive Health", "ADULT,YOUNG_ADULT", "Vegan,Organic,Gluten-Free", null,
                                "1-2 cups daily", false);
                count += seedProduct("Appetite Control Gummies", "appetite-control-gummies",
                                "Tasty gummies with glucomannan fiber for natural appetite suppression.",
                                "Glucomannan, Chromium, Apple Cider Vinegar, B6",
                                "Appetite suppression, Craving control, Fiber boost, Great taste",
                                16.99, 13.99, "SlimGummy", weightManagement, "appetite,gummies,glucomannan,cravings",
                                "Weight Loss", "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free", null, "2 gummies before meals",
                                true);
                count += seedProduct("Psyllium Husk Fiber 700mg", "psyllium-husk-fiber-700mg",
                                "Organic psyllium fiber for digestive regularity and weight management.",
                                "Organic Psyllium Husk 700mg",
                                "Fiber boost, Digestive regularity, Satiety, Cholesterol support",
                                10.99, null, "FiberMax", weightManagement, "psyllium,fiber,digestive,weight-management",
                                "Weight Loss,Digestive Health", "ADULT,SENIOR", "Vegan,Organic,Gluten-Free", null,
                                "3 capsules with water before meals", false);
                count += seedProduct("Raspberry Ketones 500mg", "raspberry-ketones-500mg",
                                "Concentrated raspberry ketones for thermogenic fat metabolism.",
                                "Raspberry Ketones 500mg, African Mango, Green Tea",
                                "Thermogenesis, Fat metabolism, Antioxidant, Energy",
                                14.99, null, "RaspBurn", weightManagement,
                                "raspberry-ketones,thermogenic,fat-burning,metabolism", "Weight Loss",
                                "ADULT,YOUNG_ADULT", "Vegan,Gluten-Free", null, "1 capsule twice daily", false);
                count += seedProduct("Carb Blocker Complex", "carb-blocker-complex",
                                "Dual-action carb and fat blocker for cheat meal support.",
                                "White Kidney Bean, Chitosan, Chromium, Green Tea",
                                "Carb blocking, Fat absorption reduction, Cheat meal support",
                                19.99, null, "CheatGuard", weightManagement,
                                "carb-blocker,fat-blocker,chitosan,weight-loss", "Weight Loss", "ADULT,YOUNG_ADULT",
                                "Gluten-Free", "Contains Shellfish", "2 capsules before large meals", false);
                count += seedProduct("Thermogenic Fat Burner", "thermogenic-fat-burner",
                                "Multi-ingredient thermogenic for metabolism and energy boost.",
                                "Caffeine 200mg, Green Tea, Cayenne, L-Carnitine, CLA",
                                "Thermogenesis, Metabolism boost, Energy, Fat oxidation",
                                24.99, 19.99, "IgniteBurn", weightManagement,
                                "thermogenic,fat-burner,caffeine,metabolism", "Weight Loss,Energy", "ADULT,YOUNG_ADULT",
                                "Gluten-Free", null, "1 capsule morning, 1 afternoon", true);

                // ========= ADDITIONAL BONE & JOINT CARE =========
                count += seedProduct("Strontium Citrate 680mg", "strontium-citrate-680mg",
                                "Trace mineral for bone density used alongside calcium and vitamin D.",
                                "Strontium Citrate 680mg",
                                "Bone density support, Osteoblast activity, Bone formation, Skeletal strength",
                                21.99, null, "BoneStrong", boneJoint, "strontium,bone-density,osteoblast,skeletal",
                                "Bone Health", "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null,
                                "1 capsule at bedtime (away from calcium)", false);
                count += seedProduct("Turmeric Joint Complex", "turmeric-joint-complex",
                                "Triple-action turmeric, boswellia, and ginger for joint comfort.",
                                "Turmeric 95%, Boswellia Serrata, Ginger Root, BioPerine",
                                "Joint comfort, Anti-inflammatory, Mobility, Pain relief",
                                22.99, 17.99, "FlexiGold", boneJoint,
                                "turmeric,joint,boswellia,ginger,anti-inflammatory", "Joint Health",
                                "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null, "2 capsules daily with meals",
                                true);
                count += seedProduct("SAMe 400mg Enteric Coated", "same-400mg-enteric",
                                "S-Adenosyl Methionine for joint cartilage and mood support.",
                                "SAMe (S-Adenosyl-L-Methionine Tosylate) 400mg",
                                "Joint cartilage, Mood support, Liver health, Methyl donor",
                                34.99, null, "JointMood", boneJoint, "same,joint,cartilage,mood,methyl-donor",
                                "Joint Health,Overall Health", "ADULT,SENIOR,MIDDLE_AGED", "Vegan,Gluten-Free", null,
                                "1 tablet daily on empty stomach", false);
                count += seedProduct("Devil's Claw Root 500mg", "devils-claw-root-500mg",
                                "African herb traditionally used for arthritis and back pain relief.",
                                "Harpagophytum Procumbens Root Extract",
                                "Arthritis relief, Back pain, Anti-inflammatory, Joint mobility",
                                15.99, null, "PainRoot", boneJoint, "devils-claw,arthritis,back-pain,anti-inflammatory",
                                "Joint Health,Pain Relief", "ADULT,SENIOR", "Vegan,Gluten-Free", null,
                                "1 capsule twice daily", false);
                count += seedProduct("Calcium Magnesium Zinc Complex", "calcium-magnesium-zinc",
                                "Comprehensive bone formula with calcium, magnesium, and zinc.",
                                "Calcium 1000mg, Magnesium 400mg, Zinc 15mg, Vitamin D3",
                                "Bone strength, Muscle function, Immune support, Mineral balance",
                                14.99, 11.99, "TripleBone", boneJoint, "calcium,magnesium,zinc,bone,mineral",
                                "Bone Health", "ADULT,SENIOR,MIDDLE_AGED", "Gluten-Free", null,
                                "2 tablets daily with meals", false);
                count += seedProduct("Bone Broth Protein Powder", "bone-broth-protein-powder",
                                "Grass-fed bone broth protein with collagen, glucosamine, and minerals.",
                                "Bone Broth Concentrate, Collagen Type II, Glucosamine, Chondroitin",
                                "Joint nourishment, Gut healing, Collagen boost, Mineral-rich",
                                36.99, 29.99, "BrothStrong", boneJoint, "bone-broth,collagen,glucosamine,gut-health",
                                "Joint Health,Digestive Health", "ADULT,SENIOR", "Gluten-Free", null,
                                "1 scoop daily in warm water", true);
                count += seedProduct("MSM Topical Cream 4oz", "msm-topical-cream-4oz",
                                "Methylsulfonylmethane cream for joint and muscle pain relief.",
                                "MSM 15%, Aloe Vera, Vitamin E, Menthol",
                                "Topical joint relief, Muscle soreness, Inflammation, Easy application",
                                16.99, null, "JointRelief", boneJoint, "msm,topical,cream,joint-pain,muscle-pain",
                                "Joint Health,Pain Relief", "ADULT,SENIOR,MIDDLE_AGED", "Paraben-Free", null,
                                "Apply to affected joints 2-3 times daily", false);
                count += seedProduct("Silica from Bamboo Extract", "silica-bamboo-extract",
                                "Organic silica from bamboo for connective tissue and bone health.",
                                "Organic Bamboo Extract 70% Silica",
                                "Connective tissue, Bone mineralization, Hair and nail strength, Collagen formation",
                                13.99, null, "SilicaPlus", boneJoint, "silica,bamboo,connective-tissue,bone,collagen",
                                "Bone Health,Hair Health,Skin Health", "ADULT,SENIOR,MIDDLE_AGED",
                                "Vegan,Organic,Gluten-Free", null, "1 capsule daily", false);
                count += seedProduct("Cetyl Myristoleate Joint Oil", "cetyl-myristoleate-550mg",
                                "Unique fatty acid complex for joint lubrication and flexibility.",
                                "Cetyl Myristoleate 550mg, Cetyl Myristate, Cetyl Oleate",
                                "Joint lubrication, Flexibility, Comfort, Immune modulation",
                                24.99, null, "FlexOil", boneJoint, "cetyl-myristoleate,joint-lubrication,flexibility",
                                "Joint Health", "ADULT,SENIOR,MIDDLE_AGED", "Gluten-Free", null,
                                "1 softgel twice daily", false);
                count += seedProduct("Type II Collagen 500mg", "type-ii-collagen-500mg",
                                "Chicken-derived Type II collagen for cartilage and joint cushioning.",
                                "Chicken Sternal Collagen Type II 500mg",
                                "Cartilage rebuild, Joint cushioning, Flexibility, Comfort",
                                21.99, null, "CartiCol", boneJoint, "collagen-type-ii,cartilage,joint,chicken",
                                "Joint Health", "ADULT,SENIOR,MIDDLE_AGED", "Gluten-Free", null,
                                "1 capsule daily on empty stomach", false);

                // ========= ADDITIONAL SKIN & HAIR CARE =========
                count += seedProduct("Astaxanthin 12mg", "astaxanthin-12mg",
                                "Powerful carotenoid antioxidant from microalgae for skin and eye protection.",
                                "Astaxanthin 12mg (Haematococcus Pluvialis)",
                                "Skin UV protection, Eye health, Anti-aging, Super antioxidant",
                                29.99, 24.99, "AstaGlow", skinHair,
                                "astaxanthin,antioxidant,skin,eye-health,anti-aging", "Skin Health,Eye Health",
                                "ADULT,YOUNG_ADULT,MIDDLE_AGED", "Gluten-Free", null, "1 softgel daily with meal",
                                true);
                count += seedProduct("Evening Primrose Oil 1300mg", "evening-primrose-oil-1300mg",
                                "GLA-rich evening primrose oil for hormonal balance and skin health.",
                                "Evening Primrose Oil, GLA 117mg",
                                "Hormonal balance, Skin hydration, PMS relief, Anti-inflammatory",
                                16.99, null, "PrimRose", skinHair, "evening-primrose,gla,hormonal,skin,pms",
                                "Skin Health,Women's Health", "ADULT,YOUNG_ADULT", "Gluten-Free", null,
                                "1 softgel daily", false);
                count += seedProduct("Niacinamide 500mg Capsules", "niacinamide-500mg",
                                "Vitamin B3 for clear complexion and skin barrier support.",
                                "Niacinamide (Vitamin B3) 500mg",
                                "Clear skin, Oil control, Pore minimizing, Barrier repair",
                                12.99, null, "SkinClear", skinHair, "niacinamide,vitamin-b3,skin,pores,oil-control",
                                "Skin Health", "ADULT,YOUNG_ADULT,TEEN", "Vegan,Gluten-Free", null, "1 capsule daily",
                                false);
                count += seedProduct("Argan Oil Pure Organic 100ml", "argan-oil-pure-organic-100ml",
                                "100% cold-pressed Moroccan argan oil for face, hair, and nails.",
                                "100% Organic Virgin Argan Oil",
                                "Multi-use moisturizer, Anti-aging, Hair conditioning, Nail strength",
                                22.99, 18.99, "ArganPure", skinHair, "argan-oil,organic,moisturizer,anti-aging,hair",
                                "Skin Health,Hair Health", "ADULT,YOUNG_ADULT", "Organic,Vegan", null,
                                "Apply 2-3 drops to skin or hair", false);
                count += seedProduct("Silk Protein Hair Mask 250ml", "silk-protein-hair-mask",
                                "Deep conditioning hair mask with silk protein and keratin.",
                                "Hydrolyzed Silk Protein, Keratin, Argan Oil, Shea Butter",
                                "Deep conditioning, Frizz taming, Shine boost, Damage repair",
                                18.99, null, "SilkHair", skinHair, "hair-mask,silk-protein,keratin,conditioning",
                                "Hair Health", "ADULT,YOUNG_ADULT", "Paraben-Free,Sulfate-Free", null,
                                "Apply to wet hair, leave 10 min, rinse", false);
                count += seedProduct("Saw Palmetto Hair Support", "saw-palmetto-hair-support",
                                "DHT-blocking saw palmetto with biotin for hair thinning support.",
                                "Saw Palmetto Berry Extract, Biotin, Zinc, Pumpkin Seed",
                                "DHT blocking, Hair thinning support, Scalp health, Hair growth",
                                21.99, 17.99, "HairSave", skinHair, "saw-palmetto,dht,hair-loss,biotin,scalp",
                                "Hair Health", "ADULT,YOUNG_ADULT,MIDDLE_AGED", "Gluten-Free", null, "2 capsules daily",
                                true);
                count += seedProduct("Ceramide Moisturizer Complex", "ceramide-moisturizer-complex",
                                "Ceramide-rich capsules for skin barrier repair and deep hydration.",
                                "Phytoceramides (Rice), Vitamins A, C, D, E",
                                "Skin barrier repair, Deep hydration, Wrinkle reduction, Elasticity",
                                26.99, null, "CeramGlow", skinHair,
                                "ceramide,skin-barrier,hydration,anti-aging,phytoceramide", "Skin Health",
                                "ADULT,MIDDLE_AGED,SENIOR", "Vegan,Gluten-Free", null, "1 capsule daily", false);
                count += seedProduct("Aloe Vera Gel Premium 500ml", "aloe-vera-gel-premium-500ml",
                                "99% pure cold-pressed aloe vera gel for skin, hair, and sunburn relief.",
                                "99% Organic Aloe Vera, Vitamin C, Vitamin E",
                                "Skin soothing, Sunburn relief, Hair conditioning, Moisturizing",
                                12.99, 9.99, "AloeMax", skinHair, "aloe-vera,skin-soothing,sunburn,moisturizer",
                                "Skin Health", "ADULT,YOUNG_ADULT,TEEN", "Organic,Vegan,Paraben-Free", null,
                                "Apply generously to skin or hair", false);
                count += seedProduct("Pumpkin Seed Oil 1000mg", "pumpkin-seed-oil-1000mg",
                                "Cold-pressed pumpkin seed oil for hair, prostate, and bladder health.",
                                "Cold-Pressed Cucurbita Pepo Seed Oil 1000mg",
                                "Hair support, Prostate health, Bladder support, Zinc-rich",
                                14.99, null, "PumpkinVita", skinHair, "pumpkin-seed,hair,prostate,bladder,zinc",
                                "Hair Health,Overall Health", "ADULT,MIDDLE_AGED,SENIOR", "Gluten-Free", null,
                                "1 softgel daily", false);
                count += seedProduct("Zinc for Clear Skin 30mg", "zinc-clear-skin-30mg",
                                "Zinc picolinate formulated specifically for acne-prone and oily skin.",
                                "Zinc Picolinate 30mg, Vitamin A, Selenium",
                                "Acne control, Oil regulation, Skin healing, Immune skin defense",
                                10.99, null, "AcneClear", skinHair, "zinc,acne,clear-skin,oil-control,healing",
                                "Skin Health", "TEEN,YOUNG_ADULT,ADULT", "Vegan,Gluten-Free", null,
                                "1 capsule daily with food", false);

                log.info("✅ Database seeded with {} products across {} categories!", count, 10);

                // Create demo users
                seedUsers();
        }

        private void seedUsers() {
                // Admin user
                User admin = User.builder()
                                .email("admin@healthshop.com")
                                .password(passwordEncoder.encode("admin123"))
                                .firstName("Admin")
                                .lastName("User")
                                .role(User.Role.ADMIN)
                                .build();
                userRepository.save(admin);

                // Demo user with health profile
                User demo = User.builder()
                                .email("demo@healthshop.com")
                                .password(passwordEncoder.encode("demo123"))
                                .firstName("John")
                                .lastName("Doe")
                                .phone("+1-555-0100")
                                .role(User.Role.USER)
                                .build();
                demo = userRepository.save(demo);

                UserHealthProfile profile = UserHealthProfile.builder()
                                .user(demo)
                                .age(35)
                                .gender("Male")
                                .height(175.0)
                                .weight(78.0)
                                .healthGoals("Heart Health,Weight Loss,Energy")
                                .allergies("Shellfish")
                                .dietaryPreferences("Gluten-Free")
                                .medicalConditions("")
                                .ageGroup(UserHealthProfile.AgeGroup.ADULT)
                                .build();
                healthProfileRepository.save(profile);

                log.info("✅ Demo users created (admin@healthshop.com / admin123, demo@healthshop.com / demo123)");

                // Seed demo orders with purchase history spanning 6 months
                seedDemoOrders(demo);

                // Seed MongoDB with sample product interactions
                seedMongoData(demo);
        }

        private void seedDemoOrders(User demoUser) {
                if (orderRepository.count() > 0) {
                        log.info("Orders already seeded. Skipping...");
                        return;
                }
                log.info("🛒 Seeding demo orders across 6 months...");

                List<Product> allProducts = productRepository.findAll();
                if (allProducts.size() < 5) {
                        log.warn("Not enough products to seed orders. Skipping...");
                        return;
                }

                Random random = new Random(42);
                LocalDateTime now = LocalDateTime.now();

                // Create 12 orders spread over the last 6 months
                int[][] orderProducts = {
                                { 0, 3 }, // order 1: 2 products
                                { 1, 5, 7 }, // order 2: 3 products
                                { 2, 4 }, // order 3: 2 products
                                { 6, 8, 10 }, // order 4: 3 products
                                { 9, 11 }, // order 5: 2 products
                                { 0, 2, 5 }, // order 6: 3 products
                                { 3, 7, 12 }, // order 7: 3 products
                                { 1, 4, 6 }, // order 8: 3 products
                                { 8, 10 }, // order 9: 2 products
                                { 0, 5, 9, 11 }, // order 10: 4 products
                                { 2, 7, 12 }, // order 11: 3 products
                                { 1, 3, 6, 8 }, // order 12: 4 products
                };
                int[] dayOffsets = { 175, 160, 145, 125, 110, 95, 78, 60, 42, 28, 14, 3 };

                for (int i = 0; i < orderProducts.length; i++) {
                        LocalDateTime orderDate = now.minusDays(dayOffsets[i]);
                        double totalAmount = 0;
                        List<OrderItem> items = new ArrayList<>();

                        Order order = Order.builder()
                                        .orderNumber("HS-DEMO-" + String.format("%04d", i + 1))
                                        .user(demoUser)
                                        .status(Order.OrderStatus.DELIVERED)
                                        .paymentStatus(Order.PaymentStatus.PAID)
                                        .paymentMethod("UPI")
                                        .shippingName(demoUser.getFirstName() + " " + demoUser.getLastName())
                                        .shippingAddress("123 Health Street")
                                        .shippingCity("Mumbai")
                                        .shippingState("Maharashtra")
                                        .shippingZip("400001")
                                        .shippingPhone(demoUser.getPhone())
                                        .createdAt(orderDate)
                                        .updatedAt(orderDate.plusDays(3))
                                        .build();

                        for (int pidx : orderProducts[i]) {
                                int safeIdx = pidx % allProducts.size();
                                Product product = allProducts.get(safeIdx);
                                int qty = 1 + random.nextInt(3);
                                double price = product.getDiscountPrice() != null
                                                ? product.getDiscountPrice()
                                                : product.getPrice();
                                double itemTotal = price * qty;
                                totalAmount += itemTotal;

                                OrderItem item = OrderItem.builder()
                                                .order(order)
                                                .product(product)
                                                .quantity(qty)
                                                .unitPrice(price)
                                                .totalPrice(itemTotal)
                                                .build();
                                items.add(item);
                        }

                        order.setTotalAmount(totalAmount);
                        order.setFinalAmount(totalAmount);
                        order.setItems(items);
                        orderRepository.save(order);
                }

                log.info("✅ Seeded {} demo orders for user {}", orderProducts.length, demoUser.getEmail());
        }

        private void seedMongoData(User demoUser) {
                try {
                        if (productInteractionRepository.count() > 0) {
                                log.info("MongoDB already seeded. Skipping...");
                                return;
                        }
                        log.info("🍃 Seeding MongoDB with sample product interactions...");

                        List<Product> allProducts = productRepository.findAll();
                        Random random = new Random(42);
                        List<ProductInteraction> interactions = new ArrayList<>();
                        String[] interactionTypes = { "VIEW", "CLICK", "PURCHASE", "WISHLIST", "CART_ADD" };
                        String[] searchQueries = { "vitamin c", "omega 3", "protein powder", "joint pain", "sleep aid",
                                        "immunity booster", "weight loss", "hair growth", "diabetes", "heart health",
                                        "energy supplement", "bone health", "skin care", "digestion", "stress relief" };

                        Long userId = demoUser.getId();

                        // Generate 100 sample interactions for demo user
                        for (int i = 0; i < 100; i++) {
                                Product product = allProducts.get(random.nextInt(allProducts.size()));
                                String type = interactionTypes[random.nextInt(interactionTypes.length)];
                                String query = random.nextInt(3) == 0
                                                ? searchQueries[random.nextInt(searchQueries.length)]
                                                : null;

                                interactions.add(ProductInteraction.builder()
                                                .userId(userId)
                                                .productId(product.getId())
                                                .interactionType(type)
                                                .searchQuery(query)
                                                .sessionId("session-" + (random.nextInt(20) + 1))
                                                .timestamp(LocalDateTime.now().minusDays(random.nextInt(30))
                                                                .minusHours(random.nextInt(24)))
                                                .build());
                        }

                        // Generate 50 interactions for admin user (userId=1)
                        for (int i = 0; i < 50; i++) {
                                Product product = allProducts.get(random.nextInt(allProducts.size()));
                                String type = interactionTypes[random.nextInt(interactionTypes.length)];

                                interactions.add(ProductInteraction.builder()
                                                .userId(1L)
                                                .productId(product.getId())
                                                .interactionType(type)
                                                .sessionId("admin-session-" + (random.nextInt(10) + 1))
                                                .timestamp(LocalDateTime.now().minusDays(random.nextInt(15))
                                                                .minusHours(random.nextInt(24)))
                                                .build());
                        }

                        productInteractionRepository.saveAll(interactions);
                        log.info("✅ MongoDB seeded with {} product interactions!", interactions.size());
                } catch (Exception e) {
                        log.warn("⚠️ MongoDB seeding failed (likely not running). Skipping Mongo data. Error: {}",
                                        e.getMessage());
                }
        }

        private Category saveCategory(String name, String slug, String description, String icon, int order) {
                return categoryRepository.save(Category.builder()
                                .name(name).slug(slug).description(description).iconName(icon).displayOrder(order)
                                .active(true)
                                .build());
        }

        private int seedProduct(String name, String slug, String desc, String ingredients, String benefits,
                        double price, Double discountPrice, String brand, Category category,
                        String tags, String healthGoals, String ageGroups, String dietary,
                        String allergens, String dosage, boolean featured) {
                Product p = Product.builder()
                                .name(name).slug(slug).description(desc).ingredients(ingredients).benefits(benefits)
                                .price(price).discountPrice(discountPrice).brand(brand).category(category)
                                .imageUrl(getCategoryImageUrl(category.getSlug(), slug))
                                .images(generateAdditionalImages(category.getSlug()))
                                .tags(tags).healthGoals(healthGoals).suitableAgeGroups(ageGroups)
                                .dietaryInfo(dietary).allergenInfo(allergens).dosage(dosage)
                                .featured(featured).active(true)
                                .stock(50 + new Random().nextInt(200))
                                .averageRating(3.5 + Math.round(new Random().nextDouble() * 3) / 2.0)
                                .reviewCount(new Random().nextInt(150))
                                .purchaseCount(new Random().nextInt(500))
                                .viewCount(new Random().nextInt(2000))
                                .build();
                productRepository.save(p);
                return 1;
        }

        // Counter to ensure every product gets a unique image
        private int productImageCounter = 0;

        private String generateAdditionalImages(String categorySlug) {
                // Generate 3 additional gallery images using picsum.photos (always online,
                // seed-based)
                int base = productImageCounter * 3;
                return String.format(
                                "https://picsum.photos/seed/health-gallery-%d/400/400," +
                                                "https://picsum.photos/seed/health-gallery-%d/400/400," +
                                                "https://picsum.photos/seed/health-gallery-%d/400/400",
                                base, base + 1, base + 2);
        }

        private String getCategoryImageUrl(String categorySlug, String productSlug) {
                // Uses picsum.photos with unique seed per product — 100% reliable, no API key
                // needed
                // Each seed produces a deterministic unique image
                String seed = categorySlug + "-" + productImageCounter++;
                return "https://picsum.photos/seed/" + seed + "/400/400";
        }
}
