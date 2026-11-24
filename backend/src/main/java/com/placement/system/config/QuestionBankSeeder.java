package com.placement.system.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.Question;
import com.placement.system.model.TestCategory;
import com.placement.system.repository.QuestionRepository;
import com.placement.system.repository.TestCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Order(2)
public class QuestionBankSeeder implements CommandLineRunner {

    @Autowired
    private TestCategoryRepository categoryRepository;

    @Autowired
    private QuestionRepository questionRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void run(String... args) {
        System.out.println("🌱 Checking Question Bank capacity across all 13 categories...");

        seedQuantitativeAptitude();
        seedLogicalReasoning();
        seedVerbalAbility();
        seedDSA();
        seedDBMS();
        seedOOP();
        seedOperatingSystems();
        seedComputerNetworks();
        seedJavaSpringBoot();
        seedWebFrontendReact();
        seedNodeBackend();
        seedMachineLearning();
        seedDataAnalytics();
        seedMockAssessments();

        shuffleExistingQuestionOptions();

        System.out.println("✅ Question Bank Seeding Completed: All 13 categories and mock assessments seeded with questions!");
    }

    private void shuffleExistingQuestionOptions() {
        try {
            List<Question> allQuestions = questionRepository.findAll();
            int shuffledCount = 0;
            for (Question q : allQuestions) {
                if (q.getOptions() == null || q.getOptions().isBlank()) continue;
                try {
                    List<String> opts = mapper.readValue(q.getOptions(), new TypeReference<List<String>>() {});
                    if (opts != null && opts.size() > 1) {
                        // If option 0 is the correct answer, shuffle to remove Option A bias
                        if (q.getCorrectAnswer() != null && opts.get(0).trim().equalsIgnoreCase(q.getCorrectAnswer().trim())) {
                            List<String> shuffled = new ArrayList<>(opts);
                            Collections.shuffle(shuffled);
                            q.setOptions(mapper.writeValueAsString(shuffled));
                            questionRepository.save(q);
                            shuffledCount++;
                        }
                    }
                } catch (Exception ignored) {}
            }
            if (shuffledCount > 0) {
                System.out.println("🔀 Shuffled options for " + shuffledCount + " questions in database where Option A was biased.");
            }
        } catch (Exception e) {
            System.err.println("Warning: Failed to shuffle existing question options: " + e.getMessage());
        }
    }

    private void addQ(String categoryName, String text, List<String> options, String correct, String explanation, String diff, String topic) {
        TestCategory cat = categoryRepository.findByName(categoryName).orElseGet(() -> {
            TestCategory newCat = new TestCategory(categoryName, "MOCK", "Practice", "Calibrated mock assessment.");
            return categoryRepository.save(newCat);
        });

        List<String> shuffledOptions = new ArrayList<>(options);
        Collections.shuffle(shuffledOptions);

        Question existing = questionRepository.findByTestCategoryIdAndQuestionText(cat.getId(), text).orElse(null);
        try {
            String optJson = mapper.writeValueAsString(shuffledOptions);
            if (existing == null) {
                Question q = new Question();
                q.setTestCategoryId(cat.getId());
                q.setQuestionText(text);
                q.setOptions(optJson);
                q.setCorrectAnswer(correct);
                q.setExplanation(explanation);
                q.setDifficulty(diff);
                q.setTopic(topic);
                q.setMarks(1);
                q.setNegativeMarks(0.25);
                questionRepository.save(q);
            } else {
                boolean needsUpdate = false;
                if (existing.getExplanation() == null || existing.getExplanation().isBlank()) {
                    existing.setExplanation(explanation);
                    needsUpdate = true;
                }
                try {
                    List<String> curOpts = mapper.readValue(existing.getOptions(), new TypeReference<List<String>>() {});
                    if (curOpts != null && !curOpts.isEmpty() && existing.getCorrectAnswer() != null && curOpts.get(0).trim().equalsIgnoreCase(existing.getCorrectAnswer().trim())) {
                        Collections.shuffle(curOpts);
                        existing.setOptions(mapper.writeValueAsString(curOpts));
                        needsUpdate = true;
                    }
                } catch (Exception ignored) {}
                if (needsUpdate) {
                    existing.setDifficulty(diff);
                    existing.setTopic(topic);
                    questionRepository.save(existing);
                }
            }
        } catch (Exception e) {
            System.err.println("Error adding question: " + e.getMessage());
        }
    }

    private void seedQuantitativeAptitude() {
        String c = "Quantitative Aptitude";
        addQ(c, "A train 180 meters long travelling at 72 km/h crosses an electric pole in how many seconds?",
                List.of("6 seconds", "9 seconds", "12 seconds", "15 seconds"),
                "9 seconds",
                "Speed in m/s = 72 * (5/18) = 20 m/s. Time to cross pole = Distance / Speed = 180 / 20 = 9 seconds.", "MEDIUM", "Speed & Distance");

        addQ(c, "A can complete a piece of work in 12 days and B can complete it in 24 days. Working together, in how many days can they complete the work?",
                List.of("6 days", "8 days", "10 days", "16 days"),
                "8 days",
                "Work done per day = 1/12 + 1/24 = (2 + 1)/24 = 3/24 = 1/8. Hence, together they take 8 days.", "EASY", "Time & Work");

        addQ(c, "If the cost price of 15 articles is equal to the selling price of 12 articles, what is the profit percentage?",
                List.of("20%", "25%", "30%", "33.33%"),
                "25%",
                "Let CP of 1 article = ₹1. CP of 12 articles = ₹12. SP of 12 articles = CP of 15 articles = ₹15. Profit = 15 - 12 = ₹3. Profit % = (3 / 12) * 100 = 25%.", "EASY", "Profit & Loss");

        addQ(c, "Two pipes A and B can fill a tank in 20 minutes and 30 minutes respectively. If both pipes are opened together, how much time will it take to fill the tank?",
                List.of("10 minutes", "12 minutes", "15 minutes", "25 minutes"),
                "12 minutes",
                "Combined rate = 1/20 + 1/30 = (3 + 2)/60 = 5/60 = 1/12 tank per minute. Total time = 12 minutes.", "EASY", "Pipes & Cisterns");

        addQ(c, "What is the compound interest on ₹10,000 for 2 years at 10% per annum compounded annually?",
                List.of("₹2,000", "₹2,100", "₹2,200", "₹2,210"),
                "₹2,100",
                "Amount = P * (1 + R/100)^T = 10000 * (1.1)^2 = 10000 * 1.21 = ₹12,100. CI = Amount - Principal = 12,100 - 10,000 = ₹2,100.", "MEDIUM", "Compound Interest");

        addQ(c, "In a lottery, there are 10 prizes and 25 blanks. A ticket is drawn at random. What is the probability of getting a prize?",
                List.of("2/7", "5/7", "2/5", "1/10"),
                "2/7",
                "Total outcomes = 10 + 25 = 35 tickets. Favorable outcomes (prizes) = 10. Probability = 10 / 35 = 2/7.", "EASY", "Probability");

        addQ(c, "In how many distinct ways can the letters of the word 'LEADER' be arranged?",
                List.of("72", "144", "360", "720"),
                "360",
                "The word LEADER contains 6 letters with 'E' repeating 2 times. Distinct permutations = 6! / 2! = 720 / 2 = 360.", "MEDIUM", "Permutations & Combinations");

        addQ(c, "The ratio of ages of father and son is 7:3. If the sum of their ages is 60 years, what is the father's age?",
                List.of("35 years", "42 years", "45 years", "48 years"),
                "42 years",
                "Let ages be 7x and 3x. 7x + 3x = 60 => 10x = 60 => x = 6. Father's age = 7 * 6 = 42 years.", "EASY", "Ratio & Proportion");

        addQ(c, "The average of 5 consecutive odd numbers is 27. What is the smallest of these numbers?",
                List.of("21", "23", "25", "27"),
                "23",
                "For consecutive numbers in arithmetic progression, the average is the middle number. So the 3rd number is 27. The numbers are 23, 25, 27, 29, 31. The smallest is 23.", "EASY", "Averages");

        addQ(c, "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.",
                List.of("3 hours", "4 hours", "5 hours", "6 hours"),
                "4 hours",
                "Downstream speed = Speed of boat + Speed of stream = 13 + 4 = 17 km/hr. Time = Distance / Speed = 68 / 17 = 4 hours.", "EASY", "Boats & Streams");

        addQ(c, "What is the remainder when 2^31 is divided by 5?",
                List.of("1", "2", "3", "4"),
                "3",
                "Powers of 2 mod 5 follow cyclicity of 4: 2^1=2, 2^2=4, 2^3=8=3, 2^4=16=1. Since 31 = 4*7 + 3, 2^31 mod 5 = 2^3 mod 5 = 8 mod 5 = 3.", "HARD", "Number System");

        addQ(c, "In what ratio must water be mixed with milk costing ₹32 per liter to get a mixture worth ₹24 per liter?",
                List.of("1:3", "1:4", "3:1", "4:1"),
                "1:3",
                "By alligation rule: Cost of water = ₹0, Cost of milk = ₹32, Mean price = ₹24. Ratio of water to milk = (32 - 24) : (24 - 0) = 8 : 24 = 1 : 3.", "MEDIUM", "Alligation & Mixture");

        addQ(c, "A person sold an article at a loss of 10%. Had he sold it for ₹45 more, he would have gained 5%. What is the cost price of the article?",
                List.of("₹250", "₹300", "₹350", "₹400"),
                "₹300",
                "Difference in percentage = 5% - (-10%) = 15%. 15% of CP = ₹45 => CP = (45 / 15) * 100 = ₹300.", "MEDIUM", "Profit & Loss");

        addQ(c, "A sphere of radius 6 cm is melted and recast into small spheres of radius 2 cm each. How many such small spheres can be formed?",
                List.of("9", "18", "27", "36"),
                "27",
                "Number of spheres = Volume of large sphere / Volume of small sphere = (4/3 * pi * R^3) / (4/3 * pi * r^3) = (6/2)^3 = 3^3 = 27.", "MEDIUM", "Mensuration");

        addQ(c, "Find the value of log_2(32) + log_3(81).",
                List.of("7", "8", "9", "10"),
                "9",
                "2^5 = 32 => log_2(32) = 5. 3^4 = 81 => log_3(81) = 4. Sum = 5 + 4 = 9.", "EASY", "Logarithms");

        addQ(c, "What was the day of the week on 15th August 1947?",
                List.of("Wednesday", "Thursday", "Friday", "Saturday"),
                "Friday",
                "Counting odd days up to 15 August 1947 yields 5 odd days, which corresponds to Friday (0 = Sun, 1 = Mon, ..., 5 = Fri).", "HARD", "Calendar");

        addQ(c, "At what angle are the hands of a clock inclined at 15 minutes past 5?",
                List.of("58.5 degrees", "67.5 degrees", "72.5 degrees", "75.0 degrees"),
                "67.5 degrees",
                "Angle formula = |30H - 5.5M| = |30(5) - 5.5(15)| = |150 - 82.5| = 67.5 degrees.", "MEDIUM", "Clocks");

        addQ(c, "A sum of ₹12,500 amounts to ₹15,500 in 4 years at simple interest. What is the rate of interest per annum?",
                List.of("4%", "5%", "6%", "7%"),
                "6%",
                "Simple Interest = 15,500 - 12,500 = ₹3,000. Rate = (SI * 100) / (P * T) = (3000 * 100) / (12500 * 4) = 300000 / 50000 = 6%.", "EASY", "Simple Interest");

        addQ(c, "A man walks at 5 km/hr and reaches office 6 minutes late. If he walks at 6 km/hr, he reaches 2 minutes early. What is the distance to his office?",
                List.of("3 km", "4 km", "5 km", "6 km"),
                "4 km",
                "Time difference = 6 min late - (-2 min early) = 8 min = 8/60 hr. Distance = (S1 * S2 * Diff) / (S2 - S1) = (5 * 6 * (8/60)) / (6 - 5) = 30 * (2/15) = 4 km.", "MEDIUM", "Speed & Distance");

        addQ(c, "If roots of equation x^2 - 7x + 12 = 0 are p and q, what is p^2 + q^2?",
                List.of("25", "37", "49", "73"),
                "25",
                "Sum of roots p + q = 7. Product p*q = 12. p^2 + q^2 = (p + q)^2 - 2pq = 7^2 - 2(12) = 49 - 24 = 25.", "EASY", "Algebra");
    }

    private void seedLogicalReasoning() {
        String c = "Logical Reasoning";
        addQ(c, "Identify the missing number in the progression: 7, 14, 28, 56, ?",
                List.of("84", "96", "112", "124"),
                "112",
                "Each consecutive term is multiplied by 2: 7*2=14, 14*2=28, 28*2=56, 56*2=112.", "EASY", "Number Series");

        addQ(c, "Statements: All cars are vehicles. All vehicles are machines. Conclusions: I. All cars are machines. II. Some machines are cars.",
                List.of("Only conclusion I follows", "Only conclusion II follows", "Both conclusions I and II follow", "Neither follows"),
                "Both conclusions I and II follow",
                "Since Cars are subset of Vehicles, and Vehicles are subset of Machines, Cars are a subset of Machines (I holds). Subsets guarantee intersection (II holds).", "EASY", "Syllogisms");

        addQ(c, "Pointing to a photograph, a woman says: 'He is the only son of my father's father.' How is the man in the photograph related to the woman?",
                List.of("Brother", "Father", "Uncle", "Grandfather"),
                "Father",
                "My father's father = Grandfather. The only son of my grandfather is my Father.", "EASY", "Blood Relations");

        addQ(c, "If 'SYSTEM' is coded as 'SYSMET' and 'NEARER' is coded as 'AENRER', how is 'FRACTION' coded?",
                List.of("CARFTINO", "CARFNOIT", "ARFCNOIT", "CARFTION"),
                "CARFTINO",
                "Split the 8-letter word into two halves: 'FRAC' and 'TION'. Reverse first half 'CARF' and reverse second half 'NOIT' (or follow swap pattern). First half reversed = CARF, second half = TINO. Result is CARFTINO.", "MEDIUM", "Coding-Decoding");

        addQ(c, "A person starts walking towards West. After walking 30 meters, he turns left and walks 20 meters. He then turns left again and walks 30 meters. How far is he from his starting point?",
                List.of("10 meters", "20 meters", "30 meters", "50 meters"),
                "20 meters",
                "West 30m, then Left (South) 20m, then Left (East) 30m. The West and East displacements cancel out, leaving him 20 meters South of the starting point.", "EASY", "Direction Sense");

        addQ(c, "In a row of 35 students, Rohan is 11th from the left end. What is his position from the right end?",
                List.of("24th", "25th", "26th", "27th"),
                "25th",
                "Total = Left + Right - 1 => 35 = 11 + Right - 1 => Right = 35 - 10 = 25th.", "EASY", "Ranking & Order");

        addQ(c, "Find the odd one out from the given group: 37, 47, 57, 67, 79",
                List.of("37", "47", "57", "67"),
                "57",
                "37, 47, 67, and 79 are prime numbers, whereas 57 is divisible by 3 (3 * 19 = 57).", "EASY", "Classification");

        addQ(c, "If '+' means multiply, '-' means divide, '*' means add, and '/' means subtract, calculate: 16 - 4 + 3 * 7 / 2",
                List.of("15", "17", "19", "21"),
                "17",
                "Substitute operations: 16 / 4 * 3 + 7 - 2 = 4 * 3 + 7 - 2 = 12 + 7 - 2 = 17.", "MEDIUM", "Mathematical Operations");

        addQ(c, "Complete the letter series: BDF, HJL, NPR, ?",
                List.of("TVX", "SUW", "TUX", "UWY"),
                "TVX",
                "Letters step by +2 internally (B, D, F). Next block starts after skipping 1 letter: F(+2)->H, L(+2)->N, R(+2)->T. Next block is T, V, X.", "EASY", "Letter Series");

        addQ(c, "Five friends A, B, C, D, and E are sitting in a circle facing the center. A is to the immediate left of B. E is between C and A. Who is to the immediate right of B?",
                List.of("C", "D", "E", "A"),
                "D",
                "Circle order clockwise: B, A, E, C, D. The person to immediate right of B is D.", "MEDIUM", "Seating Arrangement");

        addQ(c, "Statement: 'The government should deploy additional electric buses across urban routes to curb vehicular emissions.' Assumption I: Electric buses generate lower emissions than diesel buses. Assumption II: People will prefer electric buses over private vehicles.",
                List.of("Only Assumption I is implicit", "Only Assumption II is implicit", "Both I and II are implicit", "Neither is implicit"),
                "Only Assumption I is implicit",
                "The proposal is made specifically to curb emissions, which implicitly assumes electric buses produce lower emissions (Assumption I). Complete mode shift of private vehicle owners is not assumed (Assumption II is not implicit).", "MEDIUM", "Statement & Assumptions");

        addQ(c, "Statement: Many students fail the quantitative test because they lack time-management techniques. Course of Action I: Conduct dedicated timed mock tests and speed drills. Course of Action II: Discontinue quantitative testing from placement screening.",
                List.of("Only Course of Action I follows", "Only Course of Action II follows", "Both follow", "Neither follows"),
                "Only Course of Action I follows",
                "Conducting practice drills directly addresses the root cause of poor time management. Abolishing the test entirely is extreme and unjustified.", "EASY", "Statement & Course of Action");

        addQ(c, "If south-east becomes North, north-east becomes West and so on, what will West become?",
                List.of("North-East", "South-East", "North-West", "South-West"),
                "South-East",
                "The compass rotates by 135 degrees clockwise. West (at 270 degrees) rotated 135 degrees clockwise becomes South-East.", "MEDIUM", "Direction Logic");

        addQ(c, "Complete the series: 2, 6, 12, 20, 30, 42, ?",
                List.of("54", "56", "60", "64"),
                "56",
                "Pattern is n*(n+1): 1*2=2, 2*3=6, 3*4=12, 4*5=20, 5*6=30, 6*7=42, 7*8=56.", "EASY", "Number Series");

        addQ(c, "In a certain code, 'ROAD' is written as 'URDG'. How is 'SWAN' written in that code?",
                List.of("VZDQ", "VXDO", "VZCQ", "UYDP"),
                "VZDQ",
                "Each letter is shifted forward by +3: S(+3)->V, W(+3)->Z, A(+3)->D, N(+3)->Q.", "EASY", "Coding-Decoding");

        addQ(c, "Statements: Some doctors are teachers. All teachers are engineers. Conclusion I: Some engineers are doctors. Conclusion II: All doctors are engineers.",
                List.of("Only conclusion I follows", "Only conclusion II follows", "Both follow", "Neither follows"),
                "Only conclusion I follows",
                "Since some doctors are teachers and all teachers are engineers, those teachers who are doctors are also engineers. So 'Some engineers are doctors' is definitely true. All doctors are engineers cannot be deduced.", "MEDIUM", "Syllogisms");

        addQ(c, "Introducing a boy, a girl said: 'His mother is the only daughter of my mother.' How is the girl related to the boy?",
                List.of("Mother", "Sister", "Aunt", "Daughter"),
                "Mother",
                "The only daughter of my mother is myself (the girl). Thus the boy's mother is the girl herself.", "EASY", "Blood Relations");

        addQ(c, "Look at this series: 80, 10, 70, 15, 60, ?",
                List.of("20", "25", "30", "50"),
                "20",
                "Alternating series: 80, 70, 60 (-10) and 10, 15, 20 (+5). The next term follows the second pattern: 15 + 5 = 20.", "EASY", "Alternating Series");

        addQ(c, "A cube has six faces colored Red, Blue, Green, Yellow, Orange, White. Red is opposite Blue. Green is between Red and Blue. Which color is opposite Green?",
                List.of("White", "Yellow", "Orange", "Cannot be determined without additional relative positions"),
                "Cannot be determined without additional relative positions",
                "With only Red opposite Blue and Green adjacent to both, the opposite face to Green could be any of Yellow, White, or Orange without extra constraints.", "HARD", "Cube & Dice");

        addQ(c, "Choose the word which is least like the other words in the group: Zinc, Gold, Silver, Bronze, Iron",
                List.of("Zinc", "Gold", "Bronze", "Iron"),
                "Bronze",
                "Bronze is an alloy of copper and tin, whereas Zinc, Gold, Silver, and Iron are pure metallic elements on the periodic table.", "EASY", "Classification");
    }

    private void seedVerbalAbility() {
        String c = "Verbal Ability";
        addQ(c, "Choose the word most nearly OPPOSITE in meaning to 'METICULOUS':",
                List.of("Careless", "Punctual", "Methodical", "Scrupulous"),
                "Careless",
                "'Meticulous' means showing great attention to detail and careful precision. Its direct antonym is 'Careless'.", "EASY", "Antonyms");

        addQ(c, "Choose the word most nearly SIMILAR in meaning to 'PRAGMATIC':",
                List.of("Idealistic", "Practical", "Theoretical", "Speculative"),
                "Practical",
                "'Pragmatic' describes dealing with things sensibly and realistically based on practical considerations rather than theoretical ones.", "EASY", "Synonyms");

        addQ(c, "Identify the grammatical error: 'Neither the supervisor nor the engineers (A) / was present (B) / at the annual architectural review (C) / yesterday (D).'",
                List.of("A", "B", "C", "No error"),
                "B",
                "When subjects are joined by 'neither... nor', the verb agrees with the closer subject. 'Engineers' is plural, so it requires 'were present' instead of 'was present'.", "MEDIUM", "Subject-Verb Agreement");

        addQ(c, "Select the correct meaning of the idiom: 'To burn the midnight oil'",
                List.of("To cause unintentional damage", "To work or study late into the night", "To waste precious energy", "To ignite an argument"),
                "To work or study late into the night",
                "'To burn the midnight oil' historically refers to using oil lamps to work or study late into the late night hours.", "EASY", "Idioms & Phrases");

        addQ(c, "Fill in the blank with the appropriate preposition: 'The candidate was thoroughly proficient _____ algorithmic design.'",
                List.of("in", "at", "with", "on"),
                "in",
                "The adjective 'proficient' idiomatically takes the preposition 'in' when denoting a subject, discipline, or field of expertise.", "EASY", "Prepositions");

        addQ(c, "Choose the correctly spelled word:",
                List.of("Accomodate", "Accommodate", "Acommodate", "Accomadate"),
                "Accommodate",
                "'Accommodate' has double 'c' and double 'm' (A-C-C-O-M-M-O-D-A-T-E).", "EASY", "Spelling");

        addQ(c, "Select the sentence with correct punctuation and grammar:",
                List.of("Its important that the team completes it's deliverables on time.",
                        "It's important that the team completes its deliverables on time.",
                        "Its important that the team completes its deliverables on time.",
                        "It's important that the team completes it's deliverables on time."),
                "It's important that the team completes its deliverables on time.",
                "'It's' is the contraction of 'It is'. 'Its' is the possessive form referring to the team's deliverables.", "MEDIUM", "Grammar Precision");

        addQ(c, "Choose the one-word substitution for: 'One who has keen knowledge and love of fine food and drink.'",
                List.of("Gourmet", "Glutton", "Stoic", "Ascetic"),
                "Gourmet",
                "A 'Gourmet' is a connoisseur of good food. A 'Glutton' eats excessively; an 'Ascetic' practices severe self-discipline.", "EASY", "Vocabulary");

        addQ(c, "Identify the passive voice: 'The lead architect reviewed the microservice specification.'",
                List.of("The microservice specification was reviewed by the lead architect.",
                        "The microservice specification had been reviewed by the lead architect.",
                        "The lead architect had reviewed the microservice specification.",
                        "The microservice specification is reviewed by the lead architect."),
                "The microservice specification was reviewed by the lead architect.",
                "Simple past active 'reviewed' transforms into 'was reviewed' in the passive voice.", "EASY", "Active-Passive Voice");

        addQ(c, "Select the word that best completes the sentence: 'His arguments were so _____ that even his staunchest critics were persuaded.'",
                List.of("tenuous", "cogent", "specious", "vague"),
                "cogent",
                "'Cogent' means clear, logical, and convincing. 'Specious' means superficially plausible but actually wrong; 'Tenuous' means weak.", "MEDIUM", "Sentence Completion");

        addQ(c, "Choose the antonym of 'AMBIGUOUS':",
                List.of("Obscure", "Equivocal", "Lucid", "Dubious"),
                "Lucid",
                "'Ambiguous' means open to more than one interpretation or unclear. 'Lucid' means expressed clearly and easy to understand.", "EASY", "Antonyms");

        addQ(c, "Select the correct reported speech: She said, 'I will complete the backend migration tomorrow.'",
                List.of("She said that she would complete the backend migration the next day.",
                        "She said that she will complete the backend migration tomorrow.",
                        "She said that she would complete the backend migration tomorrow.",
                        "She said that she completes the backend migration the next day."),
                "She said that she would complete the backend migration the next day.",
                "In indirect speech with a past reporting verb, 'will' becomes 'would' and 'tomorrow' changes to 'the next day'.", "MEDIUM", "Direct-Indirect Speech");

        addQ(c, "Choose the analogy pair that matches: ARCHITECT : BLUEPRINT ::",
                List.of("Carpenter : Wood", "Composer : Score", "Doctor : Hospital", "Lawyer : Courtroom"),
                "Composer : Score",
                "An architect produces a blueprint as the structural master plan of a building, just as a composer produces a musical score as the master composition.", "MEDIUM", "Analogies");

        addQ(c, "Find the error: 'The team of researchers (A) / have discovered a novel enzyme (B) / that breaks down plastic polymers (C) / efficiently (D).'",
                List.of("A", "B", "C", "No error"),
                "B",
                "The subject of the sentence is the singular collective noun 'The team', not 'researchers'. Therefore, it takes singular verb 'has discovered' instead of 'have discovered'.", "MEDIUM", "Spotting Errors");

        addQ(c, "Meaning of the phrase 'Bite the bullet':",
                List.of("To face an inevitable grim situation with courage", "To act impulsively", "To criticize someone harshly", "To back down from a fight"),
                "To face an inevitable grim situation with courage",
                "'Bite the bullet' comes from historical battlefield surgery without anesthesia, meaning to endure unavoidable hardship bravely.", "EASY", "Idioms");

        addQ(c, "Choose the synonym of 'UBIQUITOUS':",
                List.of("Omnipresent", "Rare", "Scarce", "Transient"),
                "Omnipresent",
                "'Ubiquitous' means present, appearing, or found everywhere simultaneously, which is identical to 'Omnipresent'.", "EASY", "Synonyms");

        addQ(c, "Select the word for 'Fear of enclosed spaces':",
                List.of("Acrophobia", "Claustrophobia", "Agoraphobia", "Hydrophobia"),
                "Claustrophobia",
                "'Claustrophobia' is the irrational fear of confined or enclosed spaces. Acrophobia is fear of heights; Agoraphobia is fear of open/crowded spaces.", "EASY", "Vocabulary");

        addQ(c, "Rearrange parts to form a coherent sentence: P: has transformed, Q: artificial intelligence, R: modern software engineering, S: fundamentally",
                List.of("Q-P-R-S", "Q-S-P-R", "R-P-Q-S", "S-Q-P-R"),
                "Q-P-R-S",
                "Subject (Q: Artificial intelligence) + Verb (P: has transformed) + Object (R: modern software engineering) + Adverb (S: fundamentally) forms a natural English sentence.", "EASY", "Para Jumbles");

        addQ(c, "Choose the antonym of 'EPHEMERAL':",
                List.of("Fleeting", "Permanent", "Short-lived", "Evanescent"),
                "Permanent",
                "'Ephemeral' means lasting for a very short time. Its direct antonym is 'Permanent' or 'Eternal'.", "MEDIUM", "Antonyms");

        addQ(c, "Fill in the blank: 'The new security protocol is designed to _____ fraudulent transactions before they occur.'",
                List.of("preclude", "perpetuate", "foster", "disclose"),
                "preclude",
                "'Preclude' means to prevent from happening or make impossible in advance.", "MEDIUM", "Sentence Completion");
    }

    private void seedDSA() {
        String c = "Data Structures & Algorithms";
        addQ(c, "What is the tightest worst-case time complexity of finding an element in a Balanced Binary Search Tree with N nodes?",
                List.of("O(1)", "O(log N)", "O(N)", "O(N log N)"),
                "O(log N)",
                "In a height-balanced BST (such as an AVL or Red-Black Tree), the tree height is bounded strictly by O(log N), so search, insertion, and deletion run in worst-case O(log N).", "MEDIUM", "Trees");

        addQ(c, "Which data structure is intrinsically used to perform a Breadth-First Search (BFS) on an unweighted graph?",
                List.of("Stack", "Queue", "Priority Queue", "Min-Heap"),
                "Queue",
                "BFS explores neighbors level by level in First-In-First-Out (FIFO) order, requiring a Queue. DFS uses a Stack (LIFO).", "EASY", "Graphs");

        addQ(c, "What is the worst-case time complexity of standard QuickSort when an unfavorable pivot is repeatedly selected?",
                List.of("O(N)", "O(N log N)", "O(N^2)", "O(2^N)"),
                "O(N^2)",
                "When the chosen pivot is always the smallest or largest element (e.g. on an already sorted array with first-element pivot), the partition reduces the problem size by only 1, yielding O(N^2).", "MEDIUM", "Sorting");

        addQ(c, "Which algorithmic technique does Dijkstra's shortest path algorithm employ on graphs with non-negative edge weights?",
                List.of("Greedy", "Dynamic Programming", "Divide and Conquer", "Backtracking"),
                "Greedy",
                "Dijkstra's algorithm repeatedly extracts the vertex with the minimum tentative distance using a min-priority queue, exemplifying a Greedy approach.", "EASY", "Graph Algorithms");

        addQ(c, "Which data structure is optimal for implementing an LRU (Least Recently Used) cache with O(1) get and put operations?",
                List.of("HashMap + Doubly Linked List", "Balanced Binary Search Tree", "Array + Queue", "Single Linked List"),
                "HashMap + Doubly Linked List",
                "A HashMap provides O(1) lookup of node pointers, while a Doubly Linked List enables O(1) removal and insertion to the head/tail upon access.", "HARD", "System Data Structures");

        addQ(c, "What is the time complexity to insert an element into a Min-Heap containing N elements?",
                List.of("O(1)", "O(log N)", "O(N)", "O(N log N)"),
                "O(log N)",
                "The element is appended at the bottom leaf and then heapified up along the path to the root. Tree height is log N, requiring at most O(log N) swaps.", "MEDIUM", "Heaps");

        addQ(c, "Floyd's Cycle-Finding Algorithm (Tortoise and Hare) detects a cycle in a linked list using two pointers moving at speeds:",
                List.of("1 node and 2 nodes per step", "1 node and 3 nodes per step", "2 nodes and 4 nodes per step", "Both at 1 node per step"),
                "1 node and 2 nodes per step",
                "The slow pointer advances 1 step while the fast pointer advances 2 steps. If a cycle exists, the distance between them decreases by 1 each step until they collide.", "EASY", "Linked Lists");

        addQ(c, "What is the auxiliary space complexity of Merge Sort on an array of size N?",
                List.of("O(1)", "O(log N)", "O(N)", "O(N^2)"),
                "O(N)",
                "Merge Sort requires a temporary auxiliary array of size N to merge two sorted sub-arrays together.", "MEDIUM", "Sorting");

        addQ(c, "Which algorithmic paradigm does the 0/1 Knapsack problem typically use to achieve pseudo-polynomial time?",
                List.of("Dynamic Programming", "Greedy", "Branch and Bound", "Divide and Conquer"),
                "Dynamic Programming",
                "Because items cannot be fractioned, optimal substructure and overlapping subproblems are solved via a 2D/1D DP table in O(N*W) time.", "MEDIUM", "Dynamic Programming");

        addQ(c, "In Kadane's algorithm for Maximum Subarray Sum, what is the overall time complexity?",
                List.of("O(N)", "O(N log N)", "O(N^2)", "O(1)"),
                "O(N)",
                "Kadane's algorithm scans the array in a single pass, updating current_max = max(x, current_max + x) in O(N) time and O(1) auxiliary space.", "EASY", "Arrays");

        addQ(c, "What is the worst-case lookup time in a Hash Table when severe hash collisions occur and separate chaining is used with singly-linked lists?",
                List.of("O(1)", "O(log N)", "O(N)", "O(N^2)"),
                "O(N)",
                "If all keys hash to the exact same bucket index, the bucket degrades into a linear linked list of length N, requiring O(N) traversal.", "MEDIUM", "Hashing");

        addQ(c, "Which graph traversal order is produced when Topological Sort is executed on a Directed Acyclic Graph (DAG)?",
                List.of("Linear ordering where for every directed edge u -> v, u comes before v",
                        "Shortest path tree from root",
                        "Pre-order traversal of spanning forest",
                        "Sorted edge list by ascending weights"),
                "Linear ordering where for every directed edge u -> v, u comes before v",
                "Topological sort produces a valid dependency order such that prerequisite vertices precede dependent vertices.", "MEDIUM", "Graphs");

        addQ(c, "What is the minimum number of queues required to implement a First-In-First-Out Queue? (Or to implement a Stack using Queues?) To implement a LIFO Stack using FIFO Queues:",
                List.of("1 Queue", "2 Queues", "3 Queues", "Cannot be implemented"),
                "2 Queues",
                "A stack can be simulated with 2 queues by transferring elements between them on either push or pop to invert FIFO into LIFO.", "EASY", "Stacks & Queues");

        addQ(c, "In a complete binary tree with N nodes, what is the maximum height of the tree?",
                List.of("floor(log_2 N)", "ceil(N / 2)", "N - 1", "sqrt(N)"),
                "floor(log_2 N)",
                "Because all levels except possibly the last are completely filled, the height of a complete binary tree is mathematically floor(log_2 N).", "MEDIUM", "Binary Trees");

        addQ(c, "Which data structure is most efficient for prefix-search autocompletion (e.g. searching words starting with 'app')?",
                List.of("Trie (Prefix Tree)", "Binary Search Tree", "Skip List", "B-Tree"),
                "Trie (Prefix Tree)",
                "A Trie branches on each character, allowing prefix search in O(L) time where L is the prefix length, independent of total dictionary size.", "MEDIUM", "Trie");

        addQ(c, "What is the time complexity of building a Binary Heap from an unordered array of N elements using the bottom-up heapify algorithm?",
                List.of("O(N)", "O(N log N)", "O(log N)", "O(N^2)"),
                "O(N)",
                "Bottom-up heap construction runs in linear O(N) time because the majority of nodes are near the leaves and require few down-heap steps.", "HARD", "Heaps");

        addQ(c, "Disjoint Set Union (DSU) with Path Compression and Union by Rank achieves an amortized per-operation time complexity of:",
                List.of("O(1)", "O(alpha(N)) - Inverse Ackermann", "O(log N)", "O(N)"),
                "O(alpha(N)) - Inverse Ackermann",
                "The combination of union by rank and path compression achieves O(alpha(N)) per operation, which is effectively constant (<= 4) for all practical N.", "HARD", "Advanced Data Structures");

        addQ(c, "In binary search on a sorted array, what is the maximum number of comparisons needed for an array of size 1,024?",
                List.of("10", "11", "1024", "512"),
                "11",
                "Number of comparisons = floor(log_2 1024) + 1 = 10 + 1 = 11 comparisons in the worst case.", "EASY", "Searching");

        addQ(c, "Which traversal of a Binary Search Tree (BST) visits nodes in strictly ascending numerical order?",
                List.of("Pre-order", "In-order", "Post-order", "Level-order"),
                "In-order",
                "In-order traversal visits Left -> Root -> Right. For a BST, all left descendants are smaller and right descendants larger, producing sorted order.", "EASY", "Trees");

        addQ(c, "What is the time complexity of finding the strongly connected components (SCC) of a directed graph using Tarjan's or Kosaraju's algorithm?",
                List.of("O(V + E)", "O(V * E)", "O(V^2)", "O(E log V)"),
                "O(V + E)",
                "Both Tarjan's algorithm and Kosaraju's two-pass DFS compute SCCs in linear time O(V + E).", "HARD", "Graph Algorithms");
    }

    private void seedDBMS() {
        String c = "DBMS";
        addQ(c, "Which database normalization form explicitly eliminates transitive functional dependencies for non-prime attributes?",
                List.of("First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"),
                "Third Normal Form (3NF)",
                "3NF requires that a relation is in 2NF and no non-prime attribute is transitively dependent on the primary key (X -> Y where Y is non-prime implies X is a superkey).", "MEDIUM", "Normalization");

        addQ(c, "In transactional database processing, what does the 'I' in ACID guarantees represent?",
                List.of("Integrity", "Isolation", "Indexing", "Idempotency"),
                "Isolation",
                "Isolation ensures that concurrently executing transactions do not interfere with each other and execute as if running serially.", "EASY", "Transactions");

        addQ(c, "Why are B+ Trees predominantly preferred over standard B Trees for relational database storage engines (e.g. InnoDB)?",
                List.of("All data records/pointers reside only in leaf nodes, linked sequentially for high-performance range queries",
                        "B+ Trees have fewer levels than binary trees",
                        "B+ Trees do not require rebalancing",
                        "B+ Trees store duplicate keys in internal nodes to speed up hashing"),
                "All data records/pointers reside only in leaf nodes, linked sequentially for high-performance range queries",
                "In B+ Trees, interior nodes store only routing keys, allowing higher fan-out, and leaf nodes form a doubly linked list enabling lightning-fast range scans.", "HARD", "Storage & Indexing");

        addQ(c, "Which SQL JOIN returns all rows from the left table and matched rows from the right table, filling unmatched right columns with NULL?",
                List.of("INNER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL OUTER JOIN"),
                "LEFT OUTER JOIN",
                "LEFT JOIN preserves all rows from the primary left table regardless of whether a matching record exists in the right table.", "EASY", "SQL Joins");

        addQ(c, "What is a 'Dirty Read' in relational database transaction isolation?",
                List.of("Reading data written by an uncommitted concurrent transaction that subsequently rolls back",
                        "Re-reading a row and finding updated values",
                        "Executing a range query and discovering newly inserted phantom rows",
                        "Reading corrupted blocks from physical disk storage"),
                "Reading data written by an uncommitted concurrent transaction that subsequently rolls back",
                "A Dirty Read occurs at the READ UNCOMMITTED isolation level when Transaction A reads modifications made by Transaction B before B commits.", "MEDIUM", "Concurrency Control");

        addQ(c, "Which SQL constraint ensures that all values in a column are distinct and cannot contain NULL?",
                List.of("UNIQUE", "PRIMARY KEY", "FOREIGN KEY", "CHECK"),
                "PRIMARY KEY",
                "A PRIMARY KEY constraint inherently enforces both UNIQUE and NOT NULL constraints across the key columns.", "EASY", "SQL Constraints");

        addQ(c, "In a Clustered Index, how are the physical data rows stored on disk?",
                List.of("Physically sorted and stored in the exact order of the clustered index key",
                        "Stored randomly in heap blocks with separate pointer arrays",
                        "Compressed in a hash table",
                        "Cached exclusively in RAM without disk sync"),
                "Physically sorted and stored in the exact order of the clustered index key",
                "A clustered index determines the physical storage order of rows in the table; hence, a table can possess only one clustered index.", "MEDIUM", "Indexing");

        addQ(c, "Which ANSI SQL statement is utilized to undo uncommitted transaction operations?",
                List.of("COMMIT", "ROLLBACK", "REVOKE", "TRUNCATE"),
                "ROLLBACK",
                "ROLLBACK cancels all uncommitted data modifications executed within the current transaction session.", "EASY", "Transaction Commands");

        addQ(c, "What is the primary operational difference between TRUNCATE and DELETE statements in SQL?",
                List.of("TRUNCATE is a DDL command that deallocates data pages without logging individual row deletions; DELETE is DML and logs row by row",
                        "DELETE cannot have a WHERE clause",
                        "TRUNCATE fires row-level triggers",
                        "There is no operational difference"),
                "TRUNCATE is a DDL command that deallocates data pages without logging individual row deletions; DELETE is DML and logs row by row",
                "TRUNCATE resets the high-water mark and deallocates data extents quickly without firing row triggers, whereas DELETE logs each row deletion in the WAL.", "MEDIUM", "SQL DDL vs DML");

        addQ(c, "What is the strict condition for a relation to be in Boyce-Codd Normal Form (BCNF)?",
                List.of("For every non-trivial functional dependency X -> Y, X must be a superkey",
                        "Relation must be in 2NF with composite keys",
                        "Non-prime attributes must be mutually independent",
                        "All candidate keys must consist of a single column"),
                "For every non-trivial functional dependency X -> Y, X must be a superkey",
                "BCNF is a stricter version of 3NF where every determinant in a functional dependency must be a superkey.", "HARD", "Normalization");

        addQ(c, "Which concurrency control protocol guarantees conflict serializability by acquiring all locks before releasing any lock?",
                List.of("Two-Phase Locking (2PL)", "Timestamp Ordering", "Validation-Based Protocol", "Snapshot Isolation"),
                "Two-Phase Locking (2PL)",
                "Strict 2PL consists of a Growing Phase (locks acquired) and a Shrinking Phase (locks released), proving conflict serializability.", "MEDIUM", "Concurrency Control");

        addQ(c, "What is a 'Phantom Read' anomaly in database transactions?",
                List.of("A transaction re-executes a range query and discovers new rows inserted by another committed transaction",
                        "A row disappears during an update",
                        "Reading uncommitted data that is rolled back",
                        "Two transactions deadlocking on a single row"),
                "A transaction re-executes a range query and discovers new rows inserted by another committed transaction",
                "Phantom reads occur when newly inserted rows satisfy a search predicate re-evaluated within the same transaction. Prevented by SERIALIZABLE isolation.", "MEDIUM", "Isolation Levels");

        addQ(c, "Which database concept utilizes Write-Ahead Logging (WAL) to guarantee durability and crash recovery?",
                List.of("ARIES Recovery Algorithm", "B-Tree Splitting", "Two-Phase Commit", "Hash Partitioning"),
                "ARIES Recovery Algorithm",
                "WAL mandates that log records describing changes must reach non-volatile disk before the corresponding dirty data pages are flushed.", "HARD", "Database Recovery");

        addQ(c, "In SQL, what is the key difference between WHERE and HAVING clauses?",
                List.of("WHERE filters individual rows before grouping; HAVING filters aggregated groups after GROUP BY",
                        "WHERE works only with aggregate functions",
                        "HAVING cannot be used without ORDER BY",
                        "HAVING filters rows before grouping"),
                "WHERE filters individual rows before grouping; HAVING filters aggregated groups after GROUP BY",
                "WHERE evaluates row predicates prior to aggregation, while HAVING evaluates aggregate predicates (e.g. COUNT(*) > 5) after GROUP BY.", "EASY", "SQL Querying");

        addQ(c, "What is the function of a Database View?",
                List.of("A virtual table based on the result-set of an underlying SQL SELECT query",
                        "A physical backup copy of table data",
                        "A temporary table stored on client browsers",
                        "A trigger executing on table updates"),
                "A virtual table based on the result-set of an underlying SQL SELECT query",
                "A View contains no data of its own (unless materialized); it dynamically queries underlying base tables whenever invoked.", "EASY", "Views");

        addQ(c, "Which relational algebra operation corresponds to filtering columns (attributes) from a table?",
                List.of("Projection (π)", "Selection (σ)", "Cartesian Product (×)", "Set Difference (-)"),
                "Projection (π)",
                "Projection (π) extracts specified column attributes, while Selection (σ) filters rows based on a condition.", "EASY", "Relational Algebra");

        addQ(c, "What is an index covering query in SQL query optimization?",
                List.of("A query where all columns in SELECT, WHERE, and JOIN can be satisfied directly from the index tree without table heap lookup",
                        "A query that uses full table scan",
                        "A query that covers multiple database instances",
                        "A query that creates a primary key"),
                "A query where all columns in SELECT, WHERE, and JOIN can be satisfied directly from the index tree without table heap lookup",
                "A covering index eliminates expensive random I/O heap accesses because all required fields exist in the index leaf pages.", "MEDIUM", "Query Optimization");

        addQ(c, "In the CAP theorem for distributed data stores, what does 'AP' designate?",
                List.of("Availability and Partition Tolerance (system returns responses even during network partitions, sacrificing strong consistency)",
                        "Atomic Persistence",
                        "Asynchronous Processing",
                        "Automated Partitioning"),
                "Availability and Partition Tolerance (system returns responses even during network partitions, sacrificing strong consistency)",
                "An AP distributed database (like Cassandra) guarantees every non-failing node returns a response during network splits, but writes may be eventually consistent.", "HARD", "Distributed Systems");

        addQ(c, "What does the SQL COALESCE(val1, val2, val3) function return?",
                List.of("The first non-NULL expression among its arguments",
                        "The total sum of non-null arguments",
                        "Boolean true if any argument is NULL",
                        "A concatenated string of all arguments"),
                "The first non-NULL expression among its arguments",
                "COALESCE evaluates arguments in sequence and returns the first value that does not evaluate to NULL.", "EASY", "SQL Functions");

        addQ(c, "What is Multi-Version Concurrency Control (MVCC) primarily designed to achieve?",
                List.of("Readers do not block writers and writers do not block readers by maintaining multiple snapshot versions of rows",
                        "Enforce strict single-user locking",
                        "Compress database backups automatically",
                        "Distribute data across multiple geographic regions"),
                "Readers do not block writers and writers do not block readers by maintaining multiple snapshot versions of rows",
                "Engines like PostgreSQL and MySQL InnoDB use MVCC snapshots so read queries view a consistent past point in time without taking read locks.", "HARD", "MVCC");
    }

    private void seedOOP() {
        String c = "OOP Concepts";
        addQ(c, "Which SOLID principle mandates that high-level modules should not depend on low-level modules, but rather abstractions?",
                List.of("Single Responsibility Principle", "Open/Closed Principle", "Liskov Substitution Principle", "Dependency Inversion Principle"),
                "Dependency Inversion Principle",
                "The Dependency Inversion Principle (DIP) states that high-level business logic should depend upon abstractions/interfaces, not low-level concrete implementations.", "MEDIUM", "SOLID Principles");

        addQ(c, "What is the primary difference between Compile-time (Static) Polymorphism and Runtime (Dynamic) Polymorphism in Java/C++?",
                List.of("Method Overloading is static polymorphism; Method Overriding via virtual dispatch is dynamic polymorphism",
                        "Method Overriding is static; Method Overloading is dynamic",
                        "Compile-time polymorphism requires multiple inheritance",
                        "Dynamic polymorphism eliminates the need for base classes"),
                "Method Overloading is static polymorphism; Method Overriding via virtual dispatch is dynamic polymorphism",
                "Method overloading is resolved by compiler signature matching at compile time. Method overriding is resolved at runtime via virtual method tables (vtable).", "MEDIUM", "Polymorphism");

        addQ(c, "Which Design Pattern ensures that a class has only one instance and provides a global access point to it?",
                List.of("Singleton Pattern", "Factory Method Pattern", "Prototype Pattern", "Builder Pattern"),
                "Singleton Pattern",
                "The Singleton pattern restricts class instantiation to a single object, typically using a private constructor, static instance, and synchronized getInstance() accessor.", "EASY", "Design Patterns");

        addQ(c, "In object-oriented design, what is the core architectural recommendation regarding Inheritance vs Composition?",
                List.of("Favor object composition over class inheritance to reduce tight coupling and improve flexibility",
                        "Always use inheritance for code reuse",
                        "Composition cannot achieve polymorphism",
                        "Inheritance is faster than composition at runtime"),
                "Favor object composition over class inheritance to reduce tight coupling and improve flexibility",
                "Composition ('has-a') allows dynamic behavior switching at runtime and avoids fragile base class hierarchies associated with deep inheritance ('is-a').", "MEDIUM", "OOP Design Principles");

        addQ(c, "The Liskov Substitution Principle (LSP) requires that:",
                List.of("Objects of a superclass should be replaceable with objects of a subclass without breaking application correctness",
                        "Every class must implement an interface",
                        "Subclasses must override every method of their parent",
                        "Constructors must be private in derived classes"),
                "Objects of a superclass should be replaceable with objects of a subclass without breaking application correctness",
                "LSP guarantees that a subtype must preserve the behavioral contracts and invariants established by its parent type.", "MEDIUM", "SOLID");

        addQ(c, "Which design pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime?",
                List.of("Strategy Pattern", "Decorator Pattern", "Observer Pattern", "Adapter Pattern"),
                "Strategy Pattern",
                "The Strategy pattern lets the algorithm vary independently from clients that use it by encapsulating algorithms behind a shared interface.", "MEDIUM", "Design Patterns");

        addQ(c, "What is the key functional difference between an Abstract Class and an Interface in Java 8+?",
                List.of("An abstract class can maintain mutable instance state (fields) and constructors; an interface cannot hold instance state",
                        "Interfaces cannot have default methods",
                        "Abstract classes support multiple inheritance",
                        "Interfaces can have private constructors"),
                "An abstract class can maintain mutable instance state (fields) and constructors; an interface cannot hold instance state",
                "While Java 8+ interfaces support default and static methods, abstract classes remain distinct because they can declare non-static instance state and constructors.", "HARD", "OOP Fundamentals");

        addQ(c, "Which design pattern is best suited for attaching additional responsibilities to an object dynamically without modifying its class code?",
                List.of("Decorator Pattern", "Singleton Pattern", "Facade Pattern", "Bridge Pattern"),
                "Decorator Pattern",
                "Decorator wraps the original object in an implementation of the same interface, extending behavior transparently (e.g. Java IO BufferedInputStream).", "MEDIUM", "Design Patterns");

        addQ(c, "What does 'Encapsulation' achieve in object-oriented programming?",
                List.of("Bundling data and methods operating on that data into a single unit, and restricting direct external access to internal state",
                        "Allowing a class to have multiple parents",
                        "Translating source code into binary bytecode",
                        "Enabling automatic garbage collection"),
                "Bundling data and methods operating on that data into a single unit, and restricting direct external access to internal state",
                "Encapsulation protects object integrity by hiding internal fields behind access modifiers (private) and public accessors/mutators.", "EASY", "Encapsulation");

        addQ(c, "The 'Diamond Problem' in object-oriented inheritance refers to:",
                List.of("Ambiguity arising when a class inherits from two parent classes that both derive from a common grandparent class",
                        "Memory leakage in circular object references",
                        "Inability to instantiate abstract classes",
                        "Slow method execution in recursive functions"),
                "Ambiguity arising when a class inherits from two parent classes that both derive from a common grandparent class",
                "If both parent classes override a method from the grandparent, the compiler cannot deduce which method implementation the child class should inherit.", "MEDIUM", "Inheritance");

        addQ(c, "Which design pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically?",
                List.of("Observer Pattern", "Factory Pattern", "Flyweight Pattern", "Composite Pattern"),
                "Observer Pattern",
                "The Observer pattern is foundational to event-driven architectures and reactive UI frameworks where listeners subscribe to subject state changes.", "EASY", "Design Patterns");

        addQ(c, "What is the Open/Closed Principle (OCP) in software architecture?",
                List.of("Software entities should be open for extension, but closed for modification",
                        "Databases should be open to readers but closed to writers",
                        "Classes must be open source",
                        "Functions should accept open parameters but closed return types"),
                "Software entities should be open for extension, but closed for modification",
                "OCP allows developers to introduce new features through polymorphism and inheritance without altering previously tested, working production code.", "EASY", "SOLID");

        addQ(c, "In shallow copying vs deep copying of an object:",
                List.of("Shallow copy copies references to nested objects; deep copy recursively duplicates all nested objects and values",
                        "Shallow copy creates independent memory duplicates of all sub-objects",
                        "Deep copy only copies primitive numbers",
                        "There is no functional distinction in modern languages"),
                "Shallow copy copies references to nested objects; deep copy recursively duplicates all nested objects and values",
                "Modifying a nested object inside a shallow copy inadvertently mutates the original object because both reference identical memory addresses.", "MEDIUM", "Object Cloning");

        addQ(c, "What is the Interface Segregation Principle (ISP)?",
                List.of("Clients should not be forced to depend upon interface methods that they do not use",
                        "Every interface must have at least 10 methods",
                        "Interfaces should be segregated into separate databases",
                        "Classes can implement only one interface"),
                "Clients should not be forced to depend upon interface methods that they do not use",
                "ISP advises breaking down large, monolithic 'fat' interfaces into smaller, cohesive, role-specific interfaces.", "MEDIUM", "SOLID");

        addQ(c, "Which design pattern separates the construction of a complex object from its representation, allowing the same process to create various representations?",
                List.of("Builder Pattern", "Prototype Pattern", "Proxy Pattern", "Mediator Pattern"),
                "Builder Pattern",
                "The Builder pattern provides fluent chained setters step-by-step and constructs immutable target objects cleanly without telescoping constructors.", "EASY", "Design Patterns");

        addQ(c, "What is the difference between Aggregation and Composition in UML object modeling?",
                List.of("Composition represents a strong 'part-of' relationship where parts die with the whole; Aggregation represents a weaker 'has-a' where parts can exist independently",
                        "Aggregation destroys parts when parent dies",
                        "Composition is always implemented as an interface",
                        "Both represent identical object relationships"),
                "Composition represents a strong 'part-of' relationship where parts die with the whole; Aggregation represents a weaker 'has-a' where parts can exist independently",
                "In Composition (filled diamond), a House owns Rooms; destroy House and Rooms die. In Aggregation (hollow diamond), a Department has Teachers; disband Department and Teachers still exist.", "MEDIUM", "Object Modeling");

        addQ(c, "Which design pattern acts as an intermediary or wrapper that translates the interface of an existing class into another interface that clients expect?",
                List.of("Adapter Pattern", "Facade Pattern", "Proxy Pattern", "Decorator Pattern"),
                "Adapter Pattern",
                "Adapter converts incompatible APIs into a unified interface, acting as a bridge between legacy and modern code.", "EASY", "Design Patterns");

        addQ(c, "In object-oriented design, what does 'High Cohesion' signify?",
                List.of("Classes have focused, closely related responsibilities and a clear single purpose",
                        "Classes depend on as many other classes as possible",
                        "All methods are declared static",
                        "Classes have no internal private variables"),
                "Classes have focused, closely related responsibilities and a clear single purpose",
                "High cohesion alongside low coupling ensures codebases are modular, readable, easily maintainable, and straightforward to unit test.", "EASY", "Cohesion & Coupling");

        addQ(c, "Which pattern provides a surrogate or placeholder for another object to control access, perform lazy initialization, or log requests?",
                List.of("Proxy Pattern", "Flyweight Pattern", "Command Pattern", "State Pattern"),
                "Proxy Pattern",
                "The Proxy pattern controls access to a target subject (e.g. Virtual Proxy for lazy loading, Security Proxy for authorization, Spring AOP transaction proxy).", "MEDIUM", "Design Patterns");

        addQ(c, "What is the Single Responsibility Principle (SRP)?",
                List.of("A class should have one, and only one, reason to change",
                        "A class can only contain one method",
                        "An application can have only one developer",
                        "A class should handle UI, database, and business logic together"),
                "A class should have one, and only one, reason to change",
                "SRP ensures that every module or class encapsulates a single discrete piece of business functionality.", "EASY", "SOLID");
    }

    private void seedOperatingSystems() {
        String c = "Operating Systems";
        addQ(c, "What is the fundamental architectural difference between a Process and a Thread?",
                List.of("Processes have independent virtual address spaces; threads within the same process share the same memory space",
                        "Threads have separate page tables",
                        "Processes cannot communicate across networks",
                        "Threads take more memory than processes"),
                "Processes have independent virtual address spaces; threads within the same process share the same memory space",
                "A process owns resources and virtual memory. Threads within a process share the heap, text, and data segments, but possess individual program counters and stacks.", "EASY", "Process Management");

        addQ(c, "Which of the following is NOT one of the four necessary Coffman conditions for a Deadlock to occur?",
                List.of("Preemption allowed by the operating system", "Mutual Exclusion", "Hold and Wait", "Circular Wait"),
                "Preemption allowed by the operating system",
                "The 4 conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlock cannot persist.", "MEDIUM", "Deadlocks");

        addQ(c, "Which CPU scheduling algorithm gives each process a small fixed unit of CPU execution time (quantum)?",
                List.of("Round Robin (RR)", "First-Come First-Served (FCFS)", "Shortest Job First (SJF)", "Priority Scheduling"),
                "Round Robin (RR)",
                "Round Robin is preemptive and cycles through the ready queue, allocating a time quantum to guarantee fair sharing and low response times.", "EASY", "CPU Scheduling");

        addQ(c, "What is 'Thrashing' in an operating system's virtual memory management?",
                List.of("When the system spends more time servicing page faults than executing user instructions",
                        "A CPU core overheating",
                        "Corrupted hard disk sectors",
                        "Excessive context switching between two threads"),
                "When the system spends more time servicing page faults than executing user instructions",
                "Thrashing happens when the total working sets of active processes exceed available physical RAM, causing continuous page swapping to disk.", "MEDIUM", "Virtual Memory");

        addQ(c, "Which page replacement algorithm achieves the lowest possible page fault rate and is used as an idealized theoretical benchmark?",
                List.of("Belady's Optimal Page Replacement (OPT)", "Least Recently Used (LRU)", "First-In First-Out (FIFO)", "Least Frequently Used (LFU)"),
                "Belady's Optimal Page Replacement (OPT)",
                "OPT replaces the page that will not be used for the longest period of future time. It requires clairvoyance of future accesses, making it an unachievable benchmark.", "MEDIUM", "Page Replacement");

        addQ(c, "What is the primary synchronization difference between a Binary Semaphore and a Mutex?",
                List.of("A Mutex has ownership semantics (only the locking thread can unlock it); a Semaphore can be signaled/unlocked by any thread",
                        "Semaphores only work on multi-core processors",
                        "Mutexes allow negative counter values",
                        "There is no functional difference"),
                "A Mutex has ownership semantics (only the locking thread can unlock it); a Semaphore can be signaled/unlocked by any thread",
                "A Mutex is a locking mechanism with ownership. A Semaphore is a signaling mechanism (wait/signal) where thread A can wait and thread B can signal.", "MEDIUM", "Synchronization");

        addQ(c, "Which algorithm is used in operating systems for Deadlock Avoidance by dynamically evaluating resource allocation states?",
                List.of("Banker's Algorithm", "Dijkstra's Algorithm", "Kruskal's Algorithm", "Peterson's Algorithm"),
                "Banker's Algorithm",
                "Banker's algorithm tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources before approving requests.", "MEDIUM", "Deadlock Avoidance");

        addQ(c, "What occurs during an operating system Context Switch?",
                List.of("Saving the state of the current executing process (registers, PC, stack pointer) and restoring the state of the next scheduled process",
                        "Formatting the hard drive",
                        "Recompiling source code to assembly",
                        "Deleting virtual memory pages"),
                "Saving the state of the current executing process (registers, PC, stack pointer) and restoring the state of the next scheduled process",
                "Context switching saves the CPU register state into the Process Control Block (PCB) and loads the new process PCB, incurring pure computational overhead.", "EASY", "Process Scheduling");

        addQ(c, "What is an 'Orphan Process' in Unix-like operating systems?",
                List.of("A process whose parent process terminated before it did, which is then adopted by systemd/init (PID 1)",
                        "A process that has finished execution but still has an entry in the process table",
                        "A process that deadlocked",
                        "A kernel thread running in user mode"),
                "A process whose parent process terminated before it did, which is then adopted by systemd/init (PID 1)",
                "When a parent terminates without waiting for its children, they become orphans and are adopted by init/systemd. A finished process waiting for parent wait() is a Zombie.", "MEDIUM", "Process Lifecycle");

        addQ(c, "Belady's Anomaly demonstrates that:",
                List.of("For certain page replacement algorithms like FIFO, increasing the number of page frames can result in an increased number of page faults",
                        "Virtual memory reduces CPU efficiency",
                        "Threads are slower than processes",
                        "Deadlock is unavoidable in round-robin scheduling"),
                "For certain page replacement algorithms like FIFO, increasing the number of page frames can result in an increased number of page faults",
                "Belady proved that FIFO replacement can counter-intuitively trigger more page faults when allocated more physical frames.", "HARD", "Virtual Memory");

        addQ(c, "What is the purpose of the Translation Lookaside Buffer (TLB) in computer architecture?",
                List.of("A high-speed hardware cache used to reduce the time taken to translate virtual memory addresses into physical memory addresses",
                        "A buffer for disk I/O operations",
                        "A cache for network TCP packets",
                        "A storage buffer for GPU textures"),
                "A high-speed hardware cache used to reduce the time taken to translate virtual memory addresses into physical memory addresses",
                "The TLB caches recent virtual-to-physical page table translations, avoiding expensive multi-level page table traversals in main memory.", "MEDIUM", "Memory Architecture");

        addQ(c, "Which system call in Unix creates a new duplicate child process?",
                List.of("fork()", "exec()", "wait()", "clone_file()"),
                "fork()",
                "fork() spawns an exact duplicate child process with its own copy-on-write memory address space and returns child PID to parent and 0 to child.", "EASY", "System Calls");

        addQ(c, "What causes 'Internal Fragmentation' in memory management?",
                List.of("Allocating memory in fixed block sizes where the process data is smaller than the allocated block",
                        "Free memory holes scattered across memory being too small to satisfy requests",
                        "Disk sectors wearing out",
                        "TLB cache misses"),
                "Allocating memory in fixed block sizes where the process data is smaller than the allocated block",
                "Internal fragmentation leaves wasted space inside allocated fixed-size partitions. External fragmentation occurs when total free memory exists but is non-contiguous.", "EASY", "Memory Management");

        addQ(c, "What is a 'Race Condition' in concurrent programming?",
                List.of("When the output or state depends on the non-deterministic execution sequence or timing of concurrent threads accessing shared mutable state",
                        "Two threads running on two different CPU cores",
                        "A thread completing faster than expected",
                        "Network packets arriving out of order"),
                "When the output or state depends on the non-deterministic execution sequence or timing of concurrent threads accessing shared mutable state",
                "Race conditions occur when multiple threads read and write shared data without synchronization, leading to corrupt or erratic results.", "EASY", "Concurrency");

        addQ(c, "Which hardware feature allows I/O devices to transfer data directly to and from main memory without continuous CPU intervention?",
                List.of("Direct Memory Access (DMA)", "Interrupt Vector Table", "TLB", "Instruction Pipeline"),
                "Direct Memory Access (DMA)",
                "DMA allows high-speed devices (disk, NIC) to transfer data blocks directly to RAM, freeing the CPU to execute instructions concurrently.", "MEDIUM", "Hardware Systems");

        addQ(c, "In Unix file systems, what does an 'inode' store?",
                List.of("Metadata about a file such as file size, permissions, owner, timestamps, and block pointers, but NOT file name or content",
                        "The file's plain text content",
                        "The user's password",
                        "The DNS resolution address"),
                "Metadata about a file such as file size, permissions, owner, timestamps, and block pointers, but NOT file name or content",
                "An inode stores all metadata and data block disk locations. File names are stored separately inside directory file tables mapped to inode numbers.", "MEDIUM", "File Systems");

        addQ(c, "What is a 'Spinlock'?",
                List.of("A lock where a waiting thread repeatedly checks a lock variable in a tight loop ('busy-waiting') until it becomes available",
                        "A lock that rotates between CPU cores",
                        "A database deadlock detection routine",
                        "A mutex implemented in JavaScript"),
                "A lock where a waiting thread repeatedly checks a lock variable in a tight loop ('busy-waiting') until it becomes available",
                "Spinlocks avoid the context-switch cost of sleeping and are ideal in kernel programming when locks are held for minuscule nanosecond durations.", "MEDIUM", "Synchronization");

        addQ(c, "What distinguishes Preemptive scheduling from Non-preemptive scheduling?",
                List.of("Preemptive scheduling allows the OS kernel to interrupt a currently executing process to allocate CPU to a higher priority process",
                        "Non-preemptive scheduling interrupts running processes every 5ms",
                        "Preemptive scheduling is only used in batch systems",
                        "Non-preemptive scheduling requires real-time clocks"),
                "Preemptive scheduling allows the OS kernel to interrupt a currently executing process to allocate CPU to a higher priority process",
                "In non-preemptive scheduling, once a process gets CPU time, it holds it until it yields voluntarily or enters I/O waiting.", "EASY", "Scheduling");

        addQ(c, "What is the primary function of the Memory Management Unit (MMU)?",
                List.of("Translating virtual memory addresses requested by the CPU into physical memory addresses in RAM",
                        "Allocating disk sectors for database tables",
                        "Clearing unused CPU caches",
                        "Executing GPU shaders"),
                "Translating virtual memory addresses requested by the CPU into physical memory addresses in RAM",
                "The MMU is a hardware component that performs address translation and memory access permission verification on every CPU memory reference.", "EASY", "Computer Systems");

        addQ(c, "What is a 'Zombie Process' in Unix?",
                List.of("A process that has completed execution via exit(), but its entry remains in the process table because its parent has not called wait()",
                        "A process consuming 100% CPU in an infinite loop",
                        "A process that was killed by SIGKILL",
                        "A background daemon service"),
                "A process that has completed execution via exit(), but its entry remains in the process table because its parent has not called wait()",
                "A zombie retains its entry in the process table to allow its parent to read its exit status code. Once the parent calls wait(), the zombie is reaped.", "MEDIUM", "Process Table");
    }

    private void seedComputerNetworks() {
        String c = "Computer Networks";
        addQ(c, "In the OSI reference model, which layer is responsible for end-to-end reliable transmission, error recovery, and flow control?",
                List.of("Transport Layer (Layer 4)", "Network Layer (Layer 3)", "Data Link Layer (Layer 2)", "Session Layer (Layer 5)"),
                "Transport Layer (Layer 4)",
                "Layer 4 (Transport, e.g. TCP) provides end-to-end communication, segmentation, flow control (sliding window), and error recovery.", "EASY", "OSI Model");

        addQ(c, "What is the standard sequence of flags exchanged during a TCP Three-Way Handshake to establish a connection?",
                List.of("SYN -> SYN-ACK -> ACK", "ACK -> SYN -> SYN-ACK", "SYN -> ACK -> DATA", "FIN -> ACK -> FIN-ACK"),
                "SYN -> SYN-ACK -> ACK",
                "Client sends SYN (synchronize sequence numbers), server responds with SYN-ACK, and client replies with ACK to establish connection.", "EASY", "TCP Protocol");

        addQ(c, "Which DNS record type maps a human-readable domain name directly to an IPv4 address?",
                List.of("A Record", "AAAA Record", "CNAME Record", "MX Record"),
                "A Record",
                "'A' records map hostname to IPv4 (32-bit). 'AAAA' maps to IPv6 (128-bit). 'CNAME' aliases one name to another.", "EASY", "DNS");

        addQ(c, "What does HTTP status code 403 Forbidden indicate?",
                List.of("The server understands the request but refuses to authorize it due to insufficient permissions",
                        "The resource was not found on the server",
                        "The user must authenticate with valid login credentials first",
                        "The server crashed internally"),
                "The server understands the request but refuses to authorize it due to insufficient permissions",
                "401 means Unauthorized (authentication needed). 403 means Forbidden (authenticated, but lacking permissions). 404 means Not Found.", "EASY", "HTTP Protocols");

        addQ(c, "Which protocol is utilized to automatically assign IP addresses, subnet masks, and default gateways to client devices joining a network?",
                List.of("DHCP (Dynamic Host Configuration Protocol)", "DNS", "ARP", "BGP"),
                "DHCP (Dynamic Host Configuration Protocol)",
                "DHCP uses the DORA process (Discover, Offer, Request, Acknowledge) over UDP ports 67/68 to assign dynamic network configurations.", "EASY", "Network Protocols");

        addQ(c, "What is the primary function of the Address Resolution Protocol (ARP)?",
                List.of("Resolving an IP address (Network Layer) to a physical MAC address (Data Link Layer)",
                        "Converting hostnames to IP addresses",
                        "Encrypting HTTP payloads over SSL",
                        "Routing packets between autonomous systems"),
                "Resolving an IP address (Network Layer) to a physical MAC address (Data Link Layer)",
                "ARP broadcasts on a local network segment to discover the target hardware MAC address associated with a given IPv4 address.", "MEDIUM", "ARP Protocol");

        addQ(c, "In IPv4 subnetting with CIDR notation, how many usable host IP addresses are available in a /28 subnet?",
                List.of("14 usable hosts", "16 usable hosts", "30 usable hosts", "32 usable hosts"),
                "14 usable hosts",
                "A /28 subnet leaves 32 - 28 = 4 host bits. Total IPs = 2^4 = 16. Subtracting network address and broadcast address yields 16 - 2 = 14 usable host IPs.", "MEDIUM", "Subnetting");

        addQ(c, "What is the principal difference between TCP and UDP at the transport layer?",
                List.of("TCP is connection-oriented, guarantees packet ordering and reliability; UDP is connectionless, fast, and does not guarantee delivery",
                        "UDP is slower than TCP",
                        "TCP operates at Layer 3 while UDP operates at Layer 4",
                        "UDP provides retransmission of lost packets"),
                "TCP is connection-oriented, guarantees packet ordering and reliability; UDP is connectionless, fast, and does not guarantee delivery",
                "TCP performs handshakes, checksums, retransmissions, and flow control. UDP sends datagrams without establishing state, ideal for gaming and streaming.", "EASY", "Transport Protocols");

        addQ(c, "Which cryptographic handshake enables HTTPS to establish symmetric session keys over an asymmetric key exchange?",
                List.of("TLS (Transport Layer Security) Handshake", "SSH Handshake", "IPsec Tunneling", "Diffie-Hellman standalone protocol"),
                "TLS (Transport Layer Security) Handshake",
                "TLS uses public-key cryptography to authenticate servers via X.509 certificates and safely negotiate a symmetric session key for fast AES encryption.", "MEDIUM", "HTTPS & Security");

        addQ(c, "What is the maximum payload size (MTU) typically configured on standard Ethernet networks?",
                List.of("1,500 bytes", "512 bytes", "4,096 bytes", "65,535 bytes"),
                "1,500 bytes",
                "Standard Ethernet frames specify a Maximum Transmission Unit (MTU) of 1,500 bytes for the IP packet payload.", "EASY", "Ethernet");

        addQ(c, "What is Network Address Translation (NAT) primarily used for in IPv4 networks?",
                List.of("Mapping multiple private IP addresses in a local network to a single public IP address to conserve IPv4 space",
                        "Speeding up internet bandwidth",
                        "Translating domain names into MAC addresses",
                        "Preventing all malware attacks"),
                "Mapping multiple private IP addresses in a local network to a single public IP address to conserve IPv4 space",
                "NAT (especially PAT/NAPT) allows home and enterprise LANs to use private RFC 1918 addresses (192.168.x.x) and share one public IPv4 address on the WAN.", "MEDIUM", "NAT & Routing");

        addQ(c, "Which protocol does the 'ping' utility use to test network connectivity between hosts?",
                List.of("ICMP (Internet Control Message Protocol)", "TCP", "IGMP", "SNMP"),
                "ICMP (Internet Control Message Protocol)",
                "Ping sends ICMP Echo Request packets (Type 8) and waits to receive ICMP Echo Reply packets (Type 0).", "EASY", "Network Utilities");

        addQ(c, "What is a 'Reverse Proxy'?",
                List.of("A server positioned in front of backend web servers that routes client requests, load balances, and terminates SSL",
                        "A proxy that clients use to bypass local firewalls",
                        "A hardware router that inverts packet byte order",
                        "A DNS caching tool"),
                "A server positioned in front of backend web servers that routes client requests, load balances, and terminates SSL",
                "A Forward Proxy sits in front of clients; a Reverse Proxy (e.g. Nginx, HAProxy) sits in front of origin servers providing security, caching, and load balancing.", "MEDIUM", "Web Architecture");

        addQ(c, "What does the 'Time to Live' (TTL) field in an IPv4 packet header accomplish?",
                List.of("Prevents data packets from circulating infinitely in network routing loops by decrementing at each router hop",
                        "Specifies packet encryption duration",
                        "Measures download speed in seconds",
                        "Sets server timeout limits"),
                "Prevents data packets from circulating infinitely in network routing loops by decrementing at each router hop",
                "Each router that handles a packet decrements the TTL by 1. When TTL hits 0, the packet is discarded and an ICMP Time Exceeded message is sent.", "EASY", "IP Header");

        addQ(c, "Which routing algorithm is used by the Border Gateway Protocol (BGP) across the global Internet?",
                List.of("Path-Vector Protocol", "Distance-Vector Protocol (Bellman-Ford)", "Link-State Protocol (Dijkstra)", "Flooding Algorithm"),
                "Path-Vector Protocol",
                "BGP is a Path-Vector routing protocol operating between autonomous systems (AS) that prevents loops by recording the full AS-PATH.", "HARD", "Routing Protocols");

        addQ(c, "What is the difference between Symmetric Encryption and Asymmetric Encryption?",
                List.of("Symmetric uses the same secret key for both encryption and decryption; Asymmetric uses a public key to encrypt and private key to decrypt",
                        "Asymmetric encryption is faster than symmetric encryption",
                        "Symmetric encryption cannot be used over internet networks",
                        "Asymmetric encryption uses identical keys on both sides"),
                "Symmetric uses the same secret key for both encryption and decryption; Asymmetric uses a public key to encrypt and private key to decrypt",
                "Symmetric (AES, ChaCha20) is fast and encrypts bulk data. Asymmetric (RSA, ECC) solves key distribution and digital signatures.", "EASY", "Cryptography");

        addQ(c, "What is the default port number used by secure HTTPS traffic?",
                List.of("443", "80", "8080", "22"),
                "443",
                "HTTP operates on port 80; HTTPS operates on port 443; SSH operates on port 22; DNS operates on port 53.", "EASY", "Ports");

        addQ(c, "What does the TCP Sliding Window mechanism control?",
                List.of("Flow control, regulating the amount of unacknowledged data a sender can transmit before receiving an ACK",
                        "Password verification timing",
                        "Routing table hop limits",
                        "Ethernet collision detection"),
                "Flow control, regulating the amount of unacknowledged data a sender can transmit before receiving an ACK",
                "The receiver advertises its available buffer window (rwnd) in ACKs, preventing a fast sender from overwhelming a slower receiver.", "MEDIUM", "TCP Flow Control");

        addQ(c, "What distinguishes a Stateful Firewall from a Stateless Packet Filter?",
                List.of("A stateful firewall monitors the state of active TCP/UDP connections and context, rather than evaluating packets in isolation",
                        "Stateless firewalls block viruses automatically",
                        "Stateful firewalls only operate on Layer 2 MAC addresses",
                        "Stateless firewalls require session state tables"),
                "A stateful firewall monitors the state of active TCP/UDP connections and context, rather than evaluating packets in isolation",
                "Stateful firewalls inspect connection state (e.g. established sessions) allowing return traffic dynamically without opening static ports.", "MEDIUM", "Firewalls");

        addQ(c, "How does a Content Delivery Network (CDN) accelerate website delivery for global users?",
                List.of("Caches static and dynamic content at edge servers geographically close to the end user (Points of Presence)",
                        "Recompiles backend code on client machines",
                        "Eliminates the need for DNS lookups",
                        "Replaces TCP with unencrypted UDP"),
                "Caches static and dynamic content at edge servers geographically close to the end user (Points of Presence)",
                "CDNs reduce round-trip latency (RTT) and origin server load by serving cached assets from edge nodes near the client.", "EASY", "Web Performance");
    }

    private void seedJavaSpringBoot() {
        String c = "Java & Spring Boot";
        addQ(c, "In Spring Boot, which annotation is primarily used to inject bean dependencies automatically into fields or constructors?",
                List.of("@Autowired", "@Injectable", "@ComponentBinding", "@ResourceRef"),
                "@Autowired",
                "@Autowired instructs the Spring IoC container to resolve and inject a matching bean automatically by type.", "EASY", "Spring IoC & DI");

        addQ(c, "What is the key functional difference between JVM and JRE in the Java ecosystem?",
                List.of("JVM executes bytecode; JRE provides the execution environment and standard class libraries",
                        "JRE compiles source code; JVM converts to binary",
                        "JVM is only used on Windows; JRE is cross-platform",
                        "There is no difference"),
                "JVM executes bytecode; JRE provides the execution environment and standard class libraries",
                "JVM (Java Virtual Machine) is the abstract runtime that parses bytecode. JRE (Java Runtime Environment) bundles the JVM alongside core class libraries.", "MEDIUM", "Java Internals");

        addQ(c, "In Spring Boot, what is the default scope of a declared Spring Bean?",
                List.of("Singleton", "Prototype", "Request", "Session"),
                "Singleton",
                "Spring beans are Singletons by default, meaning exactly one shared instance is managed per Spring ApplicationContext container.", "EASY", "Spring Beans");

        addQ(c, "Which annotation is a convenience meta-annotation combining @Controller and @ResponseBody in Spring REST APIs?",
                List.of("@RestController", "@Service", "@Repository", "@Endpoint"),
                "@RestController",
                "@RestController indicates that every handler method serializes its return value directly into the HTTP response body as JSON/XML.", "EASY", "Spring Web");

        addQ(c, "In Spring Data JPA, which interface provides ready-to-use CRUD and pagination methods without requiring manual boilerplate SQL?",
                List.of("JpaRepository", "CrudService", "HibernateSession", "EntityManagerDao"),
                "JpaRepository",
                "JpaRepository extends PagingAndSortingRepository and CrudRepository, providing save(), findAll(), delete(), and pagination out of the box.", "EASY", "Spring Data JPA");

        addQ(c, "What does the @Transactional annotation in Spring manage?",
                List.of("Defines the boundary of a database transaction, automatically committing on success and rolling back on runtime exceptions",
                        "Enables multi-threading on the method",
                        "Caches the method return value in Redis",
                        "Encrypts incoming request parameters"),
                "Defines the boundary of a database transaction, automatically committing on success and rolling back on runtime exceptions",
                "Spring creates an AOP proxy around @Transactional methods that starts a transaction, commits upon completion, and rolls back on Unchecked (RuntimeException) exceptions.", "MEDIUM", "Spring Transactions");

        addQ(c, "What is the purpose of Spring Boot's @EnableAutoConfiguration (included in @SpringBootApplication)?",
                List.of("Automatically configures Spring beans based on jar dependencies detected on the classpath",
                        "Compiles Java files automatically into JARs",
                        "Generates database tables without entities",
                        "Deploys application to AWS automatically"),
                "Automatically configures Spring beans based on jar dependencies detected on the classpath",
                "Auto-configuration inspects classpath starters (e.g. spring-boot-starter-web) and automatically registers appropriate beans like DispatcherServlet and Tomcat.", "MEDIUM", "Spring Boot Core");

        addQ(c, "How does a Java HashMap handle collisions internally starting in Java 8?",
                List.of("Uses linked lists initially, and converts bucket chains into balanced Red-Black Trees when bucket size exceeds 8",
                        "Overwrites previous values automatically",
                        "Throws a HashCollisionException",
                        "Shifts elements to next adjacent array bucket"),
                "Uses linked lists initially, and converts bucket chains into balanced Red-Black Trees when bucket size exceeds 8",
                "Java 8 treeifies long collision chains (TREEIFY_THRESHOLD = 8) into TreeNode red-black trees, improving worst-case search from O(N) to O(log N).", "HARD", "Java Collections");

        addQ(c, "What is the difference between String, StringBuilder, and StringBuffer in Java?",
                List.of("String is immutable; StringBuilder is mutable and non-thread-safe; StringBuffer is mutable and thread-safe (synchronized)",
                        "StringBuilder is immutable and synchronized",
                        "String and StringBuilder have identical performance",
                        "StringBuffer cannot be modified after creation"),
                "String is immutable; StringBuilder is mutable and non-thread-safe; StringBuffer is mutable and thread-safe (synchronized)",
                "String allocates new memory on every modification. StringBuilder mutates in-place fast without locking overhead. StringBuffer synchronizes methods for thread safety.", "EASY", "Java Core");

        addQ(c, "In Java, what is the difference between Checked and Unchecked Exceptions?",
                List.of("Checked exceptions extend Exception (excluding RuntimeException) and must be caught or declared; Unchecked exceptions extend RuntimeException",
                        "Unchecked exceptions must always be caught using try-catch",
                        "Checked exceptions happen only during JVM crash",
                        "There is no compiler difference"),
                "Checked exceptions extend Exception (excluding RuntimeException) and must be caught or declared; Unchecked exceptions extend RuntimeException",
                "The Java compiler forces handling of Checked exceptions (e.g. IOException, SQLException). Runtime exceptions (e.g. NullPointerException) are unchecked.", "MEDIUM", "Java Exceptions");

        addQ(c, "What is the function of the Spring Boot Actuator module?",
                List.of("Provides production-ready monitoring endpoints like /health, /metrics, /env, and /info",
                        "Acts as a visual UI designer for web components",
                        "Compiles microservices into native Docker images",
                        "Enforces JWT user authentication on databases"),
                "Provides production-ready monitoring endpoints like /health, /metrics, /env, and /info",
                "Spring Boot Actuator exposes operational HTTP and JMX metrics allowing DevOps monitoring systems (Prometheus, Grafana) to scrape application health.", "EASY", "Spring Boot Actuator");

        addQ(c, "Which Java 8 feature allows functional-style operations on collections such as map, filter, and reduce?",
                List.of("Stream API", "Fork/Join Pool", "Reflection API", "Java Virtual Threads"),
                "Stream API",
                "Streams enable declarative pipelines to filter, transform, and aggregate collections without explicit loop mutation.", "EASY", "Java 8 Features");

        addQ(c, "In Hibernate/JPA, what does Lazy Loading (FetchType.LAZY) accomplish?",
                List.of("Defers fetching associated entity data from the database until the getter method is explicitly called",
                        "Loads all child records immediately in a single query",
                        "Deletes child records when parent is updated",
                        "Disables database indexing"),
                "Defers fetching associated entity data from the database until the getter method is explicitly called",
                "Lazy loading avoids the N+1 select problem and heavy memory allocation by populating proxy stubs until fields are traversed inside a transaction.", "MEDIUM", "Hibernate & JPA");

        addQ(c, "What is Constructor Injection preferred over Field Injection (@Autowired on private fields) in modern Spring Boot?",
                List.of("Promotes immutability (final fields), prevents NullPointerExceptions, and enables easy unit testing without mocking reflection",
                        "Field injection is deprecated in Java 17",
                        "Constructor injection executes faster on GPUs",
                        "Constructor injection disables Spring container overhead"),
                "Promotes immutability (final fields), prevents NullPointerExceptions, and enables easy unit testing without mocking reflection",
                "Constructor injection ensures beans are fully initialized with all dependencies, supports 'final' immutability, and simplifies POJO testing with mock instances.", "MEDIUM", "Spring Best Practices");

        addQ(c, "What is the purpose of the Java 'volatile' keyword when applied to a variable?",
                List.of("Guarantees visibility of changes across threads by reading and writing directly to main memory rather than CPU local caches",
                        "Makes the variable immutable like final",
                        "Provides atomic increments without synchronized locks",
                        "Serializes the variable to disk"),
                "Guarantees visibility of changes across threads by reading and writing directly to main memory rather than CPU local caches",
                "Volatile ensures that writes made by one thread are immediately visible to subsequent reads by other threads (establishes happens-before relationship).", "HARD", "Java Concurrency");

        addQ(c, "In Spring Security, what is the role of a OncePerRequestFilter?",
                List.of("Guarantees that a custom security filter (such as JWT token validation) is executed exactly once per incoming client request dispatch",
                        "Blocks duplicate HTTP requests from the browser",
                        "Clears database connection pools after every request",
                        "Caches response data for 60 seconds"),
                "Guarantees that a custom security filter (such as JWT token validation) is executed exactly once per incoming client request dispatch",
                "OncePerRequestFilter ensures authentication filtering (e.g. reading Authorization header, parsing JWT, setting SecurityContext) executes only once.", "MEDIUM", "Spring Security");

        addQ(c, "What is a 'Java Record' introduced in modern Java (Java 16+)?",
                List.of("An immutable data-carrier class that automatically generates private final fields, constructor, getters, equals, hashCode, and toString",
                        "A database table entity mapped to PostgreSQL",
                        "A logging framework replacing Logback",
                        "A thread-safe alternative to HashMap"),
                "An immutable data-carrier class that automatically generates private final fields, constructor, getters, equals, hashCode, and toString",
                "Records eliminate boilerplate DTO code by generating constructors and accessors automatically for defined components.", "EASY", "Modern Java");

        addQ(c, "In Spring Boot, how do you handle environment-specific configurations (e.g. application-dev.properties vs application-prod.properties)?",
                List.of("Using Spring Profiles (spring.profiles.active=dev/prod)",
                        "Writing separate Java main classes for each environment",
                        "Hardcoding database URLs into source code",
                        "Deleting properties files before deployment"),
                "Using Spring Profiles (spring.profiles.active=dev/prod)",
                "Spring Profiles segregate environment configurations and allow activating specific profiles via environment variables or CLI flags.", "EASY", "Spring Configuration");

        addQ(c, "What is the Garbage Collector's role in the Java Virtual Machine?",
                List.of("Automatically identifies and deallocates memory occupied by objects that are no longer reachable by any active thread",
                        "Deletes expired database records",
                        "Compresses compiled jar files",
                        "Terminates idle HTTP client connections"),
                "Automatically identifies and deallocates memory occupied by objects that are no longer reachable by any active thread",
                "The JVM Garbage Collector periodically traverses object reference graphs from GC Roots and reclaims unreachable heap memory.", "EASY", "JVM Memory");

        addQ(c, "Which annotation is used in Spring to catch and handle exceptions globally across all controllers?",
                List.of("@ControllerAdvice (or @RestControllerAdvice)", "@ExceptionHandlerStandalone", "@GlobalCatch", "@CatchAll"),
                "@ControllerAdvice (or @RestControllerAdvice)",
                "@RestControllerAdvice allows defining centralized @ExceptionHandler methods that intercept exceptions thrown across all controller endpoints.", "MEDIUM", "Spring Web");
    }

    private void seedWebFrontendReact() {
        String c = "Web Frontend & React";
        addQ(c, "In React 18, which React hook should be utilized to perform side effects such as data subscriptions or manual DOM modifications?",
                List.of("useState", "useEffect", "useMemo", "useContext"),
                "useEffect",
                "useEffect runs side-effect logic (API fetches, timers, event listeners) after the component renders.", "EASY", "React Hooks");

        addQ(c, "What is the fundamental architectural benefit of the React Virtual DOM during state changes?",
                List.of("Diffs changes in-memory and minimizes expensive real-DOM re-paint operations",
                        "Directly binds to GPU hardware acceleration",
                        "Eliminates JavaScript runtime overhead",
                        "Stores component state permanently in local storage"),
                "Diffs changes in-memory and minimizes expensive real-DOM re-paint operations",
                "React's reconciliation algorithm computes the minimal set of real DOM mutations needed, avoiding costly browser reflows and repaints.", "MEDIUM", "Virtual DOM");

        addQ(c, "Why is the 'key' prop mandatory when rendering dynamic lists in React?",
                List.of("Helps React identify which items have changed, been added, or been removed during reconciliation",
                        "Applies unique CSS styles to each list item",
                        "Encrypts list data before rendering",
                        "Binds event listeners to child nodes"),
                "Helps React identify which items have changed, been added, or been removed during reconciliation",
                "Keys give stable identity to elements across renders, allowing React to preserve component state and avoid re-mounting unchanged DOM nodes.", "EASY", "React Rendering");

        addQ(c, "What is the difference between useMemo and useCallback in React?",
                List.of("useMemo memoizes the computed return value of a function; useCallback memoizes the callback function instance itself",
                        "useCallback memoizes return values; useMemo memoizes functions",
                        "useMemo executes only on server components",
                        "useCallback is only used with Redux"),
                "useMemo memoizes the computed return value of a function; useCallback memoizes the callback function instance itself",
                "useMemo caches expensive calculations between renders. useCallback caches function references to prevent unnecessary child re-renders.", "MEDIUM", "React Performance");

        addQ(c, "In React, what constitutes a 'Controlled Component'?",
                List.of("A form input element whose value is controlled exclusively by React component state via value and onChange props",
                        "A component wrapped inside an Error Boundary",
                        "A component controlled by backend server APIs",
                        "A component rendered with Redux"),
                "A form input element whose value is controlled exclusively by React component state via value and onChange props",
                "In controlled components, form data is handled by a React component state, making state the single source of truth.", "EASY", "Forms");

        addQ(c, "What does the cleanup function returned inside a useEffect hook accomplish?",
                List.of("Executes before the component unmounts and before re-running the effect to clean up timers, subscriptions, or listeners",
                        "Deletes component state from memory",
                        "Cleans browser cookies automatically",
                        "Forces a hard browser refresh"),
                "Executes before the component unmounts and before re-running the effect to clean up timers, subscriptions, or listeners",
                "The cleanup function prevents memory leaks by canceling ongoing network requests, clearing intervals, or removing DOM event listeners.", "MEDIUM", "React Hooks");

        addQ(c, "What is 'Prop Drilling' in React and how is it commonly resolved?",
                List.of("Passing props through multiple intermediate components that do not need them; resolved using React Context API or state management libraries",
                        "Passing props to database tables; resolved using SQL",
                        "Drilling holes in virtual DOM nodes; resolved by keys",
                        "An error thrown when props are undefined"),
                "Passing props through multiple intermediate components that do not need them; resolved using React Context API or state management libraries",
                "Prop drilling couples unrelated intermediary components. Context API and Zustand/Redux provide centralized stores accessible anywhere in the tree.", "EASY", "State Management");

        addQ(c, "In CSS, what is the primary difference between CSS Grid and CSS Flexbox?",
                List.of("Flexbox is primarily one-dimensional (row or column); Grid is two-dimensional (simultaneous rows and columns)",
                        "Flexbox only works in modern browsers; Grid works on all",
                        "Grid is only used for text formatting",
                        "Flexbox does not support alignment"),
                "Flexbox is primarily one-dimensional (row or column); Grid is two-dimensional (simultaneous rows and columns)",
                "Flexbox handles linear content flow in a single direction. Grid excels at composite page layouts coordinating rows and columns simultaneously.", "EASY", "CSS Layout");

        addQ(c, "What is 'Event Bubbling' in the browser Document Object Model (DOM)?",
                List.of("When an event triggered on a child node propagates upward through its ancestor hierarchy toward the document root",
                        "Events being dropped due to memory limits",
                        "Events creating duplicate DOM nodes",
                        "When an event is captured from window to target"),
                "When an event triggered on a child node propagates upward through its ancestor hierarchy toward the document root",
                "Event propagation begins with the capturing phase, hits the target phase, and then bubbles upward through parent nodes unless event.stopPropagation() is called.", "MEDIUM", "Browser DOM");

        addQ(c, "What is Cross-Origin Resource Sharing (CORS)?",
                List.of("A browser security mechanism using HTTP headers to permit or restrict resources requested from a different domain/origin",
                        "A technique to share CSS stylesheets",
                        "A database replication tool",
                        "A React hook for fetching data"),
                "A browser security mechanism using HTTP headers to permit or restrict resources requested from a different domain/origin",
                "CORS prevents malicious websites on domain-A from making unauthorized background requests to API endpoints on domain-B via browser Same-Origin Policy.", "MEDIUM", "Web Security");

        addQ(c, "In React, what are 'Synthetic Events'?",
                List.of("Cross-browser wrappers around the browser's native event system that normalize event behavior across different browsers",
                        "Events simulated by AI bots",
                        "Fake events generated by unit tests",
                        "Events that bypass the JavaScript event loop"),
                "Cross-browser wrappers around the browser's native event system that normalize event behavior across different browsers",
                "SyntheticEvent provides identical properties (preventDefault, stopPropagation, target) across all major browser implementations.", "MEDIUM", "React Internals");

        addQ(c, "How does Tailwind CSS differ from traditional CSS component libraries like Bootstrap?",
                List.of("Tailwind provides low-level atomic utility classes allowing arbitrary custom designs without overriding opinionated components",
                        "Tailwind requires writing raw SQL queries",
                        "Tailwind cannot be used with React",
                        "Bootstrap produces smaller bundle sizes"),
                "Tailwind provides low-level atomic utility classes allowing arbitrary custom designs without overriding opinionated components",
                "Tailwind generates minimal utility CSS on demand via PurgeCSS/JIT compiler, enabling highly customized UI design directly in markup.", "EASY", "Tailwind CSS");

        addQ(c, "What does the useRef hook in React provide that useState does not?",
                List.of("Mutating the .current property of a ref does NOT trigger a component re-render",
                        "useRef can only store strings",
                        "useRef persists data to local storage",
                        "useRef executes side effects automatically"),
                "Mutating the .current property of a ref does NOT trigger a component re-render",
                "useRef holds a mutable reference across renders (ideal for DOM element access, previous state tracking, and interval IDs) without causing re-renders.", "MEDIUM", "React Hooks");

        addQ(c, "What is the Core Web Vital metric 'Largest Contentful Paint' (LCP) measuring?",
                List.of("The time taken to render the largest visible image or text block within the user's viewport",
                        "The time to run JavaScript bundle parsing",
                        "The total size of CSS files in kilobytes",
                        "The visual layout shift during page scrolling"),
                "The time taken to render the largest visible image or text block within the user's viewport",
                "LCP measures perceived load speed. Google recommends an LCP of under 2.5 seconds for good user experience.", "MEDIUM", "Web Vitals");

        addQ(c, "What is the primary difference between localStorage and sessionStorage in browser storage?",
                List.of("localStorage data persists indefinitely until explicitly cleared; sessionStorage data is purged when the browser tab closes",
                        "sessionStorage stores up to 5GB of data",
                        "localStorage is accessible only on HTTPS",
                        "sessionStorage data is shared across different browser tabs"),
                "localStorage data persists indefinitely until explicitly cleared; sessionStorage data is purged when the browser tab closes",
                "Both store key-value strings (~5MB quota), but sessionStorage lifespan is strictly scoped to the active browser tab session.", "EASY", "Web Storage");

        addQ(c, "What is 'Debouncing' in frontend event handling?",
                List.of("Delaying the execution of a function until a specified idle duration has passed since the last time the event was triggered",
                        "Executing a function immediately on every keypress",
                        "Canceling all background network requests",
                        "Preventing forms from submitting"),
                "Delaying the execution of a function until a specified idle duration has passed since the last time the event was triggered",
                "Debouncing in search input fields delays the API request until the user pauses typing for e.g. 300ms, eliminating excessive redundant network calls.", "MEDIUM", "Frontend Optimization");

        addQ(c, "In React, what is an 'Error Boundary'?",
                List.of("A class component implementing componentDidCatch or getDerivedStateFromError that catches JavaScript errors in child trees and renders fallback UI",
                        "A try-catch block inside an event handler",
                        "A firewall blocking unauthorized web requests",
                        "A TypeScript type checking compiler flag"),
                "A class component implementing componentDidCatch or getDerivedStateFromError that catches JavaScript errors in child trees and renders fallback UI",
                "Error Boundaries catch unhandled runtime errors during rendering in child component trees, preventing the whole React application from crashing.", "MEDIUM", "React Reliability");

        addQ(c, "What does the React hook useReducer provide over standard useState?",
                List.of("Managing complex state transitions based on dispatched actions following a state machine pattern similar to Redux",
                        "Automatic caching in localStorage",
                        "Eliminates component re-renders",
                        "Runs asynchronous database migrations"),
                "Managing complex state transitions based on dispatched actions following a state machine pattern similar to Redux",
                "useReducer is ideal when subsequent state depends on previous state or multiple sub-values change in response to specific user actions.", "MEDIUM", "State Architecture");

        addQ(c, "What is 'Hydration' in the context of Server-Side Rendering (SSR) with React?",
                List.of("Attaching event listeners and React runtime state to pre-rendered HTML received from the server",
                        "Cleaning memory leaks in the browser",
                        "Injecting CSS styles into head tags",
                        "Downloading JSON data from the backend"),
                "Attaching event listeners and React runtime state to pre-rendered HTML received from the server",
                "SSR sends raw HTML for fast initial paint; React then 'hydrates' this static markup by binding JavaScript event listeners and Virtual DOM reconciliation.", "HARD", "Server-Side Rendering");

        addQ(c, "Why should you never mutate state directly in React (e.g. state.push(item) instead of setState([...state, item]))?",
                List.of("Direct mutation does not trigger re-renders because React compares object references using shallow equality (Object.is)",
                        "JavaScript throws a syntax error on array mutation",
                        "Mutations delete component history",
                        "Direct mutation corrupts browser memory"),
                "Direct mutation does not trigger re-renders because React compares object references using shallow equality (Object.is)",
                "React relies on immutable state references to detect when changes occur and schedule UI reconciliation.", "EASY", "React Fundamentals");
    }

    private void seedNodeBackend() {
        String c = "Node.js & Backend Architecture";
        addQ(c, "How does Node.js successfully handle thousands of concurrent client requests despite its single-threaded JavaScript execution model?",
                List.of("Through an asynchronous, non-blocking Event Loop powered by libuv",
                        "By spawning native OS threads for every incoming TCP socket",
                        "By utilizing synchronous thread sleep routines",
                        "Through multi-core CPU time slicing"),
                "Through an asynchronous, non-blocking Event Loop powered by libuv",
                "Node.js offloads I/O operations (file system, network, DNS) to operating system kernel mechanisms or libuv thread pools, notifying JavaScript via callbacks on the Event Loop.", "MEDIUM", "Event Loop");

        addQ(c, "In the Node.js event loop, what is the execution priority difference between process.nextTick() and setImmediate()?",
                List.of("process.nextTick() executes immediately after the current operation before the event loop continues; setImmediate() executes on the next check phase",
                        "setImmediate() executes before process.nextTick()",
                        "Both execute in the timers phase with setTimeout",
                        "process.nextTick() executes only on server shutdown"),
                "process.nextTick() executes immediately after the current operation before the event loop continues; setImmediate() executes on the next check phase",
                "process.nextTick() queues callbacks in the microtask queue, which is drained immediately after the current tick of the call stack before moving to subsequent event loop phases.", "HARD", "Node.js Internals");

        addQ(c, "What are the three components of a JSON Web Token (JWT) separated by periods?",
                List.of("Header, Payload, and Signature", "Username, Password, and Role", "Issuer, Audience, and Scope", "Token, Key, and Salt"),
                "Header, Payload, and Signature",
                "A JWT comprises Base64Url-encoded Header (algorithm/type), Payload (claims/user data), and cryptographic Signature generated with secret or private key.", "EASY", "JWT Security");

        addQ(c, "In Express.js, what is the purpose of the 'next' callback parameter in middleware functions?",
                List.of("Passes control to the next middleware function in the request-response processing pipeline",
                        "Redirects the client to the next page",
                        "Executes the next iteration of a database loop",
                        "Terminates the HTTP connection"),
                "Passes control to the next middleware function in the request-response processing pipeline",
                "Calling next() hands off execution to the subsequent handler. If called with an error argument (next(err)), Express bypasses normal handlers and routes to error-handling middleware.", "EASY", "Express Middleware");

        addQ(c, "In MongoDB, what is the aggregation pipeline stage used to group documents by a specified identifier and compute accumulators?",
                List.of("$group", "$match", "$project", "$lookup"),
                "$group",
                "The $group stage groups input documents by a specified _id expression and applies accumulator expressions ($sum, $avg, $push) to produce summary results.", "EASY", "MongoDB Aggregation");

        addQ(c, "Why is hashing passwords with bcrypt or Argon2 preferred over raw MD5 or SHA-256 in backend authentication?",
                List.of("bcrypt incorporates cryptographic salting and an adjustable computational work factor to resist brute-force and rainbow table attacks",
                        "bcrypt is faster than SHA-256",
                        "MD5 passwords cannot be saved in databases",
                        "SHA-256 produces reversible passwords"),
                "bcrypt incorporates cryptographic salting and an adjustable computational work factor to resist brute-force and rainbow table attacks",
                "Fast hashes like SHA-256 allow attackers to compute billions of guesses per second on GPUs. Slow salted hashes like bcrypt thwart GPU acceleration.", "MEDIUM", "Backend Security");

        addQ(c, "What is a 'Stream' in Node.js and why is it beneficial for handling large files?",
                List.of("An abstraction for reading/writing data piece by piece (chunks) without loading the entire file into RAM at once",
                        "A database replication log",
                        "A WebSocket video protocol",
                        "A synchronous buffer allocation array"),
                "An abstraction for reading/writing data piece by piece (chunks) without loading the entire file into RAM at once",
                "Streams process data incrementally, allowing a 10GB file to be transferred with minimal memory consumption.", "MEDIUM", "Node.js Streams");

        addQ(c, "In RESTful API design, which HTTP method is expected to be idempotent and used to replace an entire resource representation?",
                List.of("PUT", "POST", "PATCH", "DELETE"),
                "PUT",
                "PUT replaces the target resource representation in full and is idempotent (executing it multiple times with the same body yields identical state). PATCH performs partial updates.", "EASY", "REST Design");

        addQ(c, "How do you handle unhandled promise rejections globally in a Node.js process?",
                List.of("process.on('unhandledRejection', (reason, promise) => { ... })",
                        "window.onerror = ...",
                        "try-catch around server.listen()",
                        "Node.js ignores unhandled rejections automatically"),
                "process.on('unhandledRejection', (reason, promise) => { ... })",
                "Listening to the unhandledRejection process event allows logging unhandled rejected promises and performing graceful process teardown.", "MEDIUM", "Node.js Error Handling");

        addQ(c, "In MongoDB, which aggregation stage performs an equality match equivalent to a relational LEFT OUTER JOIN between collections?",
                List.of("$lookup", "$join", "$unwind", "$merge"),
                "$lookup",
                "$lookup performs a left outer join to an unsharded collection in the same database to filter in documents from the joined collection.", "EASY", "MongoDB");

        addQ(c, "What is SQL / NoSQL Injection in backend web applications?",
                List.of("When untrusted user input is concatenated directly into database query strings, allowing attackers to manipulate query logic",
                        "When database memory overflows into disk",
                        "When passwords expire unexpectedly",
                        "A technique for indexing columns faster"),
                "When untrusted user input is concatenated directly into database query strings, allowing attackers to manipulate query logic",
                "Injection attacks occur when user input is treated as executable query commands instead of parameterized data arguments.", "EASY", "Application Security");

        addQ(c, "What is the role of Redis in high-throughput backend microservices?",
                List.of("An in-memory key-value data store used as a sub-millisecond cache, session store, and pub/sub message broker",
                        "A relational database storing binary images",
                        "A JavaScript compilation bundler",
                        "An operating system kernel module"),
                "An in-memory key-value data store used as a sub-millisecond cache, session store, and pub/sub message broker",
                "Redis stores data structures in RAM, providing ultra-low-latency reads that shield primary relational databases from repetitive queries.", "EASY", "Caching Architecture");

        addQ(c, "What does the Node.js 'cluster' module enable?",
                List.of("Spawning multiple worker processes that share the same server port to take advantage of multi-core CPU architectures",
                        "Connecting multiple MongoDB databases together",
                        "Clustering CSS files into a single bundle",
                        "Enabling automatic containerization with Kubernetes"),
                "Spawning multiple worker processes that share the same server port to take advantage of multi-core CPU architectures",
                "Because single-threaded Node.js uses one CPU core, cluster.fork() spawns worker processes to distribute incoming traffic across all available CPU cores.", "MEDIUM", "Node.js Clustering");

        addQ(c, "What is the purpose of the 'package-lock.json' file in npm projects?",
                List.of("Locks down the exact semantic version and integrity hash of every installed dependency to guarantee reproducible builds across environments",
                        "Encrypts the source code repository",
                        "Locks the server from unauthorized HTTP requests",
                        "Stores private environment secrets"),
                "Locks down the exact semantic version and integrity hash of every installed dependency to guarantee reproducible builds across environments",
                "package-lock.json ensures that running 'npm install' in production installs the exact identical dependency tree as was resolved in development.", "EASY", "Node Ecosystem");

        addQ(c, "What is Cross-Site Scripting (XSS) and how should backends defend against it?",
                List.of("Injecting malicious scripts into web pages viewed by other users; defended by sanitizing input, escaping output, and setting Content-Security-Policy",
                        "Attacking the server database with SQL scripts",
                        "Flooding network ports with SYN packets",
                        "Stealing passwords via brute force"),
                "Injecting malicious scripts into web pages viewed by other users; defended by sanitizing input, escaping output, and setting Content-Security-Policy",
                "XSS allows attackers to execute rogue JavaScript in victim browsers to steal session cookies or localStorage JWT tokens.", "MEDIUM", "Web Security");

        addQ(c, "What is the purpose of 'Rate Limiting' on backend API endpoints?",
                List.of("Restricting the number of requests a client can make in a given timeframe to prevent DoS attacks, brute force, and abuse",
                        "Limiting network bandwidth to 10 Mbps",
                        "Restricting database storage to 1GB",
                        "Preventing users from logging out"),
                "Restricting the number of requests a client can make in a given timeframe to prevent DoS attacks, brute force, and abuse",
                "Rate limiting (e.g. using token-bucket in Redis or express-rate-limit) protects APIs from credential stuffing and resource exhaustion.", "EASY", "API Protection");

        addQ(c, "In Express, what signature uniquely identifies an Error-Handling middleware function?",
                List.of("A function with four parameters: (err, req, res, next)",
                        "A function with two parameters: (err, res)",
                        "A function returning a Promise rejection",
                        "A function decorated with @CatchError"),
                "A function with four parameters: (err, req, res, next)",
                "Express distinguishes standard middleware (3 arguments: req, res, next) from error-handling middleware by checking function.length === 4.", "MEDIUM", "Express Architecture");

        addQ(c, "What is the primary difference between Long Polling and WebSockets for real-time data?",
                List.of("Long Polling repeatedly opens and closes HTTP connections; WebSockets establish a persistent, bidirectional, full-duplex TCP connection",
                        "Long Polling is faster than WebSockets",
                        "WebSockets only work on mobile browsers",
                        "Long Polling does not use HTTP"),
                "Long Polling repeatedly opens and closes HTTP connections; WebSockets establish a persistent, bidirectional, full-duplex TCP connection",
                "WebSockets eliminate HTTP handshake overhead after the initial upgrade, allowing instant server-push messages with minimal frame headers.", "MEDIUM", "Real-Time Systems");

        addQ(c, "What is the difference between synchronous fs.readFileSync() and asynchronous fs.readFile() in Node.js?",
                List.of("fs.readFileSync() blocks the entire Node.js event loop thread until the file is read; fs.readFile() executes non-blockingly via callbacks/promises",
                        "fs.readFileSync() is non-blocking",
                        "fs.readFile() cannot read binary files",
                        "Both behave identically"),
                "fs.readFileSync() blocks the entire Node.js event loop thread until the file is read; fs.readFile() executes non-blockingly via callbacks/promises",
                "Synchronous file I/O halts all concurrent HTTP handling in Node.js; asynchronous calls delegate I/O to libuv without stalling the event loop.", "EASY", "File System");

        addQ(c, "What is 'Content-Security-Policy' (CSP) in HTTP response headers?",
                List.of("An HTTP header that restricts the sources from which scripts, styles, images, and fonts can be loaded and executed by the browser",
                        "A policy restricting database connections",
                        "A cookie encryption protocol",
                        "A method to enable cross-domain iframe embedding"),
                "An HTTP header that restricts the sources from which scripts, styles, images, and fonts can be loaded and executed by the browser",
                "CSP is a powerful browser defense against XSS that disallows inline scripts and enforces trusted whitelist origins for executable assets.", "MEDIUM", "HTTP Security");
    }

    private void seedMachineLearning() {
        String c = "Machine Learning & Python";
        addQ(c, "Which classical machine learning algorithm finds the optimal decision hyperplane that maximizes the geometric margin between data classes?",
                List.of("Support Vector Machines (SVM)", "K-Means Clustering", "Naive Bayes Classifier", "Linear Regression"),
                "Support Vector Machines (SVM)",
                "SVM formulates maximum margin hyperplanes using support vectors, and uses kernel tricks (RBF, polynomial) to handle non-linear separations.", "MEDIUM", "Classification");

        addQ(c, "In deep neural network training, which activation function mitigates the vanishing gradient problem commonly found in Sigmoid units?",
                List.of("Rectified Linear Unit (ReLU)", "Hyperbolic Tangent (Tanh)", "Softmax", "Binary Step Function"),
                "Rectified Linear Unit (ReLU)",
                "ReLU (f(x) = max(0, x)) has a constant gradient of 1 for positive inputs, preventing gradients from vanishing during backpropagation through deep layers.", "MEDIUM", "Neural Networks");

        addQ(c, "What does the 'Bias-Variance Trade-off' describe in machine learning models?",
                List.of("High bias leads to underfitting (oversimplified models); high variance leads to overfitting (capturing random noise in training data)",
                        "Bias measures dataset size; variance measures learning rate",
                        "High bias is always preferred in production",
                        "Variance only occurs in unsupervised learning"),
                "High bias leads to underfitting (oversimplified models); high variance leads to overfitting (capturing random noise in training data)",
                "Total generalization error equals Bias^2 + Variance + Irreducible Error. Minimizing one often increases the other.", "EASY", "ML Theory");

        addQ(c, "Which regularization technique adds the sum of absolute values of coefficients (L1 penalty) to the loss function, inducing feature sparsity?",
                List.of("Lasso Regularization (L1)", "Ridge Regularization (L2)", "ElasticNet", "Dropout"),
                "Lasso Regularization (L1)",
                "Lasso shrinks coefficients to exactly zero, performing automatic feature selection. Ridge (L2) squares coefficients, shrinking them toward zero without zeroing them.", "MEDIUM", "Regularization");

        addQ(c, "In binary classification with imbalanced classes (e.g. 99% negative, 1% fraud), why is Accuracy a misleading evaluation metric?",
                List.of("A naive model predicting 'negative' for all samples achieves 99% accuracy while detecting zero fraud instances",
                        "Accuracy cannot be calculated on binary labels",
                        "Accuracy is sensitive only to false alarms",
                        "Imbalanced datasets require regression metrics"),
                "A naive model predicting 'negative' for all samples achieves 99% accuracy while detecting zero fraud instances",
                "When class distributions are skewed, Precision, Recall, F1-Score, and PR-AUC give true visibility into minority-class detection performance.", "EASY", "Evaluation Metrics");

        addQ(c, "What does 'Precision' measure in classification evaluation?",
                List.of("The proportion of predicted positive instances that were truly positive (True Positives / (True Positives + False Positives))",
                        "The proportion of actual positives correctly identified",
                        "The overall percentage of correct predictions",
                        "The ratio of false alarms to true negatives"),
                "The proportion of predicted positive instances that were truly positive (True Positives / (True Positives + False Positives))",
                "Precision answers: 'Of all the cases the model flagged as positive, how many were correct?'. Recall answers: 'Of all actual positive cases, how many did it catch?'.", "EASY", "Metrics");

        addQ(c, "What is the primary architectural concept behind Ensemble Random Forests?",
                List.of("Bagging (Bootstrap Aggregation), training multiple decorrelated decision trees on random subsets of data and features to reduce variance",
                        "Sequentially correcting errors of previous trees via gradient descent",
                        "Clustering data points into k groups",
                        "Training a single deep neural network"),
                "Bagging (Bootstrap Aggregation), training multiple decorrelated decision trees on random subsets of data and features to reduce variance",
                "Random Forest combines bagging with random feature selection per split, dramatically reducing individual tree variance without increasing bias.", "MEDIUM", "Ensemble Methods");

        addQ(c, "What is the key difference between Bagging and Boosting in ensemble learning?",
                List.of("Bagging trains independent models in parallel to reduce variance; Boosting trains models sequentially to correct previous errors and reduce bias",
                        "Bagging is sequential; Boosting is parallel",
                        "Bagging only works on neural networks",
                        "Boosting always causes severe underfitting"),
                "Bagging trains independent models in parallel to reduce variance; Boosting trains models sequentially to correct previous errors and reduce bias",
                "Bagging (Random Forest) averages independent parallel predictors. Boosting (AdaBoost, XGBoost) sequentially fits subsequent trees to residual errors.", "MEDIUM", "Ensemble Learning");

        addQ(c, "Which unsupervised clustering algorithm iteratively assigns points to the nearest centroid and updates centroids to the mean of assigned points?",
                List.of("K-Means Clustering", "DBSCAN", "Hierarchical Clustering", "Gaussian Mixture Models"),
                "K-Means Clustering",
                "K-Means alternates between expectation (assigning points to closest center) and maximization (recomputing cluster centroid means) until convergence.", "EASY", "Clustering");

        addQ(c, "What is Principal Component Analysis (PCA) used for in machine learning?",
                List.of("Dimensionality reduction by finding orthogonal axes of maximum variance in the feature space",
                        "Training deep neural networks",
                        "Detecting missing values in tables",
                        "Classifying text sentiment"),
                "Dimensionality reduction by finding orthogonal axes of maximum variance in the feature space",
                "PCA computes eigenvectors of the data covariance matrix to project high-dimensional data onto lower-dimensional orthogonal principal components.", "MEDIUM", "Dimensionality Reduction");

        addQ(c, "In gradient descent optimization, what does the Learning Rate parameter control?",
                List.of("The step size taken toward the minimum of the loss function along the negative gradient direction",
                        "The number of epochs to train",
                        "The size of hidden layers in neural networks",
                        "The percentage of test data"),
                "The step size taken toward the minimum of the loss function along the negative gradient direction",
                "If learning rate is too large, optimization diverges or oscillates wildly; if too small, training converges agonizingly slowly or traps in local minima.", "EASY", "Optimization");

        addQ(c, "Which loss function is standard for training multi-class classification neural networks with a Softmax output layer?",
                List.of("Categorical Cross-Entropy Loss", "Mean Squared Error (MSE)", "Mean Absolute Error (MAE)", "Hinge Loss"),
                "Categorical Cross-Entropy Loss",
                "Categorical cross-entropy measures the divergence between the true one-hot distribution and the predicted probability distribution from Softmax.", "MEDIUM", "Loss Functions");

        addQ(c, "What is 'Data Leakage' in machine learning pipeline development?",
                List.of("When information from the test/target dataset is inadvertently used to train the model, producing unrealistically optimistic test scores",
                        "A database memory leak",
                        "When data is leaked across internet firewalls",
                        "Dropping rows with missing values"),
                "When information from the test/target dataset is inadvertently used to train the model, producing unrealistically optimistic test scores",
                "Examples include fitting standard scalers on the entire dataset before splitting train/test, or including features derived from the future target label.", "MEDIUM", "ML Pipelines");

        addQ(c, "Why is Dropout effective at preventing overfitting in deep neural networks?",
                List.of("Randomly deactivates a fraction of neurons during each training step, preventing co-adaptation of features",
                        "Doubles the number of training parameters",
                        "Freezes learning rates permanently",
                        "Eliminates backpropagation calculations"),
                "Randomly deactivates a fraction of neurons during each training step, preventing co-adaptation of features",
                "By dropping random units during forward passes, the network cannot rely on any single neuron and is forced to learn redundant, robust feature representations.", "MEDIUM", "Deep Learning");

        addQ(c, "In Natural Language Processing, what core mechanism enables Transformer models (e.g. BERT, GPT) to process entire sequences in parallel?",
                List.of("Self-Attention Mechanism", "Recurrent Hidden States", "Convolutional Max-Pooling", "Markov Decision Chains"),
                "Self-Attention Mechanism",
                "Self-attention calculates pairwise attention weights (Query, Key, Value matrices) across all tokens simultaneously, bypassing sequential RNN bottlenecks.", "HARD", "Transformers");

        addQ(c, "What does the Area Under the ROC Curve (ROC-AUC) measure?",
                List.of("The probability that the classifier ranks a randomly chosen positive instance higher than a randomly chosen negative instance across all classification thresholds",
                        "The percentage of true positives at a 0.5 threshold",
                        "The speed of model prediction",
                        "The correlation between input features"),
                "The probability that the classifier ranks a randomly chosen positive instance higher than a randomly chosen negative instance across all classification thresholds",
                "ROC-AUC evaluates True Positive Rate vs False Positive Rate across all possible discrimination thresholds, offering a threshold-independent performance score.", "MEDIUM", "Evaluation");

        addQ(c, "What is 'K-Fold Cross-Validation'?",
                List.of("Splitting the dataset into K equal subsets, training on K-1 folds and validating on the remaining fold K times to obtain a robust performance estimate",
                        "Training a model K times on the same dataset",
                        "Selecting the top K features in a dataset",
                        "Clustering data into K groups"),
                "Splitting the dataset into K equal subsets, training on K-1 folds and validating on the remaining fold K times to obtain a robust performance estimate",
                "K-Fold Cross-Validation reduces validation variance by ensuring every data sample is used for validation exactly once across K iterations.", "EASY", "Validation");

        addQ(c, "In Python's NumPy library, what is 'Broadcasting'?",
                List.of("The ability of NumPy to perform arithmetic operations on arrays of different shapes during vectorized computations without copying data",
                        "Sending arrays over network sockets",
                        "Converting arrays into Python lists",
                        "Printing array elements to the console"),
                "The ability of NumPy to perform arithmetic operations on arrays of different shapes during vectorized computations without copying data",
                "Broadcasting dynamically stretches compatible smaller dimensions across larger dimensions to enable fast element-wise C-level operations.", "MEDIUM", "NumPy");

        addQ(c, "What is the difference between supervised learning and unsupervised learning?",
                List.of("Supervised learning trains on labeled input-output pairs; unsupervised learning discovers latent patterns or groupings in unlabeled data",
                        "Supervised learning requires no training data",
                        "Unsupervised learning always produces higher accuracy",
                        "Supervised learning cannot do classification"),
                "Supervised learning trains on labeled input-output pairs; unsupervised learning discovers latent patterns or groupings in unlabeled data",
                "Supervised learning trains on labeled data (regression, classification). Unsupervised learning operates on unlabeled inputs (clustering, dimensionality reduction).", "EASY", "ML Fundamentals");

        addQ(c, "In Convolutional Neural Networks (CNNs), what is the function of a Pooling layer (e.g. MaxPooling)?",
                List.of("Downsamples spatial feature map dimensions to reduce computation and provide translation invariance",
                        "Multiplies weights by filter kernels",
                        "Applies non-linear activation",
                        "Normalizes batch gradients to zero"),
                "Downsamples spatial feature map dimensions to reduce computation and provide translation invariance",
                "MaxPooling downsamples height and width dimensions by taking the maximum value in each window, reducing parameters and imparting spatial invariance.", "MEDIUM", "CNN");
    }

    private void seedDataAnalytics() {
        String c = "Data Analytics & BI (SQL/Tableau)";
        addQ(c, "Which ANSI SQL window function assigns a contiguous sequential integer to each row within a window partition starting at 1?",
                List.of("ROW_NUMBER()", "DENSE_RANK()", "LEAD()", "PARTITION_INDEX()"),
                "ROW_NUMBER()",
                "ROW_NUMBER() assigns unique sequential integers (1, 2, 3...) to rows without gaps or ties. RANK() creates gaps on ties; DENSE_RANK() ties without gaps.", "EASY", "SQL Analytical Functions");

        addQ(c, "What is the difference between RANK() and DENSE_RANK() when duplicate values occur in SQL?",
                List.of("RANK() skips subsequent rank numbers after ties (e.g. 1, 2, 2, 4); DENSE_RANK() leaves no gaps (e.g. 1, 2, 2, 3)",
                        "DENSE_RANK() skips numbers; RANK() leaves no gaps",
                        "RANK() only works on string columns",
                        "There is no difference"),
                "RANK() skips subsequent rank numbers after ties (e.g. 1, 2, 2, 4); DENSE_RANK() leaves no gaps (e.g. 1, 2, 2, 3)",
                "DENSE_RANK preserves consecutive integers after ties, making it ideal for e.g. finding the Nth highest salary.", "EASY", "Window Functions");

        addQ(c, "In business intelligence enterprise data modeling, what architectural pattern connects a central fact table directly to surrounding dimension tables?",
                List.of("Star Schema", "Snowflake Schema (Normalized)", "Galaxy Constellation", "Relational 3NF"),
                "Star Schema",
                "In a Star Schema, a central Fact table containing quantitative metrics/keys is surrounded by de-normalized Dimension tables, optimizing analytical read queries.", "EASY", "Data Modeling");

        addQ(c, "What does the SQL window function LEAD(column_name, 1) OVER (PARTITION BY ... ORDER BY ...) return?",
                List.of("The value of column_name from the subsequent row following the current row in the ordered partition",
                        "The value from the preceding row",
                        "The average of all partition rows",
                        "The maximum value in the partition"),
                "The value of column_name from the subsequent row following the current row in the ordered partition",
                "LEAD accesses data from subsequent rows; LAG accesses data from previous rows without requiring self-joins.", "EASY", "SQL Window Functions");

        addQ(c, "In data warehousing, what is the key characteristic of a Fact Table?",
                List.of("Contains foreign keys and quantitative numeric measures (metrics, sales amounts, counts) of business events",
                        "Contains descriptive textual attributes like customer names and addresses",
                        "Stores database user passwords",
                        "Stores temporary web sessions"),
                "Contains foreign keys and quantitative numeric measures (metrics, sales amounts, counts) of business events",
                "Fact tables record measurable numerical events (sales, revenue, transactions) alongside foreign keys linking to contextual Dimension tables.", "EASY", "Data Warehousing");

        addQ(c, "What is a Common Table Expression (CTE) defined with the 'WITH' clause in SQL?",
                List.of("A temporary named result set that exists only within the execution scope of a single SELECT, INSERT, UPDATE, or DELETE statement",
                        "A permanent physical table saved on disk",
                        "A stored procedure compiled in C",
                        "A database trigger"),
                "A temporary named result set that exists only within the execution scope of a single SELECT, INSERT, UPDATE, or DELETE statement",
                "CTEs improve query readability and modularity, and support recursive hierarchical queries (e.g. organizational chart traversal).", "EASY", "SQL CTEs");

        addQ(c, "In dimensional data modeling, what is a Slowly Changing Dimension Type 2 (SCD Type 2)?",
                List.of("Tracks full historical changes by inserting a new row with start/end effective dates or version flags whenever an attribute changes",
                        "Overwrites the old value in place, destroying history (Type 1)",
                        "Creates a new column for previous values (Type 3)",
                        "Deletes previous rows automatically"),
                "Tracks full historical changes by inserting a new row with start/end effective dates or version flags whenever an attribute changes",
                "SCD Type 2 is the gold standard for tracking audit history in analytical data warehouses by adding new versioned records.", "MEDIUM", "Data Warehousing");

        addQ(c, "What is the difference between an ETL pipeline and an ELT pipeline in modern cloud data warehouses (e.g. Snowflake, BigQuery)?",
                List.of("ETL transforms data on an external server before loading; ELT loads raw data directly into the cloud data warehouse and transforms using scalable SQL compute",
                        "ELT cannot handle structured data",
                        "ETL does not extract data",
                        "There is no architectural difference"),
                "ETL transforms data on an external server before loading; ELT loads raw data directly into the cloud data warehouse and transforms using scalable SQL compute",
                "Cloud warehouses possess massive distributed compute, making it faster and cheaper to ingest raw data first (Extract, Load) and Transform in-database via SQL/dbt.", "MEDIUM", "Data Pipelines");

        addQ(c, "In Tableau data visualization, what is the visual distinction between Dimensions and Measures?",
                List.of("Dimensions contain qualitative, categorical data (e.g. names, dates, regions); Measures contain quantitative numerical values that can be aggregated (e.g. profit, sales)",
                        "Measures are qualitative categories; Dimensions are numbers",
                        "Dimensions are always colored green",
                        "Measures cannot be calculated"),
                "Dimensions contain qualitative, categorical data (e.g. names, dates, regions); Measures contain quantitative numerical values that can be aggregated (e.g. profit, sales)",
                "Dimensions slice the data into headers; Measures are aggregated by functions like SUM(), AVG(), MIN(), MAX() into quantitative axes.", "EASY", "BI Fundamentals");

        addQ(c, "What is a Level of Detail (LOD) expression in Tableau (e.g. {FIXED [Region] : SUM([Sales])})?",
                List.of("An expression that computes aggregates at a specified dimension granularity independent of the dimensions present in the visualization view",
                        "A method to filter database rows by date",
                        "A visual palette color setting",
                        "A tool to format Excel spreadsheets"),
                "An expression that computes aggregates at a specified dimension granularity independent of the dimensions present in the visualization view",
                "LOD expressions (FIXED, INCLUDE, EXCLUDE) give precise control over the level of calculation regardless of how granular or zoomed the visual chart is.", "HARD", "Tableau LOD");

        addQ(c, "In statistical data analytics, what does a Pearson Correlation Coefficient of -0.92 indicate?",
                List.of("A strong negative linear relationship between two continuous variables (as one increases, the other decreases consistently)",
                        "A weak positive relationship",
                        "No correlation whatsoever",
                        "A data calculation error since correlation must be positive"),
                "A strong negative linear relationship between two continuous variables (as one increases, the other decreases consistently)",
                "Correlation r ranges from -1 to +1. Values near -1 denote strong inverse linear correlation; values near 0 denote absence of linear relationship.", "EASY", "Statistics");

        addQ(c, "What does the SQL window frame clause 'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW' compute when used with SUM(sales)?",
                List.of("A cumulative running total of sales from the start of the partition up to the current row",
                        "The moving average of the last 3 rows",
                        "The total sum of the entire table",
                        "The difference between first and last rows"),
                "A cumulative running total of sales from the start of the partition up to the current row",
                "This window frame specification computes cumulative running metrics (e.g. Year-to-Date revenue).", "MEDIUM", "SQL Window Frames");

        addQ(c, "How is the Interquartile Range (IQR) method utilized for outlier detection in dataset exploration?",
                List.of("Outliers are identified as values falling below Q1 - 1.5*IQR or above Q3 + 1.5*IQR, where IQR = Q3 - Q1",
                        "Values greater than the mean are flagged as outliers",
                        "Any negative value is an outlier",
                        "Points with duplicate keys are outliers"),
                "Outliers are identified as values falling below Q1 - 1.5*IQR or above Q3 + 1.5*IQR, where IQR = Q3 - Q1",
                "The 1.5*IQR rule is a robust, non-parametric standard used in box plots to flag anomalous extremes without assuming a Gaussian distribution.", "MEDIUM", "Statistical Analysis");

        addQ(c, "What does the SQL PIVOT operation accomplish?",
                List.of("Rotates row-based table data into column-based aggregations to transform narrow normalized tables into crosstab summary matrices",
                        "Sorts rows in descending alphabetical order",
                        "Deletes duplicate records from a table",
                        "Joins two tables on primary keys"),
                "Rotates row-based table data into column-based aggregations to transform narrow normalized tables into crosstab summary matrices",
                "PIVOT turns unique values from one column into multiple output columns, while UNPIVOT turns columns back into rows.", "MEDIUM", "Advanced SQL");

        addQ(c, "In Business Intelligence, what is a 'Snowflake Schema'?",
                List.of("A variant of the Star Schema where dimension tables are normalized into multiple related sub-tables to reduce data redundancy",
                        "A schema where fact tables have no foreign keys",
                        "A database hosted exclusively in cold climates",
                        "An unindexed relational schema"),
                "A variant of the Star Schema where dimension tables are normalized into multiple related sub-tables to reduce data redundancy",
                "Snowflake schema normalizes dimensions (e.g. splitting Product into Category and Subcategory tables), saving storage but requiring more joins.", "MEDIUM", "Data Warehousing");

        addQ(c, "What is a 'Cohort Analysis' frequently performed by product data analysts?",
                List.of("Tracking the behavioral metrics (e.g. retention, churn, spend) of a group of users who share a common characteristic over time",
                        "Comparing database query execution times",
                        "Analyzing server hardware temperatures",
                        "Predicting stock market indexes with neural networks"),
                "Tracking the behavioral metrics (e.g. retention, churn, spend) of a group of users who share a common characteristic over time",
                "Cohort analyses (e.g. users who signed up in January vs February) track user retention curves over subsequent weeks/months.", "MEDIUM", "Product Analytics");

        addQ(c, "In executive dashboard design, which data visualization chart is most effective for displaying part-to-whole relationships over time?",
                List.of("Stacked Bar Chart or 100% Stacked Area Chart", "Scatter Plot with regression line", "Radar Chart", "Bubble Chart"),
                "Stacked Bar Chart or 100% Stacked Area Chart",
                "100% Stacked Area and Bar charts visualize how individual segment percentages contribute to the total 100% whole across time periods.", "EASY", "Data Visualization");

        addQ(c, "What is the primary difference between Data Blending and Data Joining in Tableau?",
                List.of("Joining combines tables at the row level before aggregation; Blending queries independent data sources at their respective levels and combines aggregated results",
                        "Blending can only join tables from the same database",
                        "Joining is always executed in client memory",
                        "There is no difference"),
                "Joining combines tables at the row level before aggregation; Blending queries independent data sources at their respective levels and combines aggregated results",
                "Data Blending acts as a post-aggregate left join, allowing disparate data sources with different granularities to be visualized cleanly on one canvas.", "HARD", "Tableau Architecture");

        addQ(c, "What does the SQL command 'NULLIF(expr1, expr2)' return?",
                List.of("NULL if expr1 equals expr2; otherwise returns expr1",
                        "True if expr1 is null",
                        "expr2 if expr1 is null",
                        "The count of null values"),
                "NULL if expr1 equals expr2; otherwise returns expr1",
                "NULLIF is commonly used to prevent division-by-zero errors: e.g. numerator / NULLIF(denominator, 0) returns NULL instead of throwing an error.", "MEDIUM", "SQL Functions");

        addQ(c, "What is the distinction between 'Correlation' and 'Causation' in business analytics?",
                List.of("Correlation implies two variables move together statistically; Causation proves that a change in one variable directly causes change in the other",
                        "Correlation proves direct cause and effect",
                        "Causation cannot be tested using A/B testing",
                        "They are interchangeable terms"),
                "Correlation implies two variables move together statistically; Causation proves that a change in one variable directly causes change in the other",
                "Observing that ice cream sales and sunburns correlate does not mean ice cream causes sunburns (both are caused by hot weather, a confounding variable).", "EASY", "Analytics Acumen");
    }

    private void seedMockAssessments() {
        seedJavaFullStackMock();
        seedMernMock();
        seedAiMlMock();
        seedDataAnalyticsMock();
    }

    private void seedJavaFullStackMock() {
        for (String c : List.of("Java Full Stack Mock Assessment", "Java Mock Assessment")) {
            addQ(c, "In Spring Boot, how does the IoC container handle circular dependencies between two @Service beans initialized via constructor injection?",
                    List.of("Throws BeanCurrentlyInCreationException unless @Lazy or setter injection is configured",
                            "Automatically caches partial bytecode in heap",
                            "Silently deletes one service bean",
                            "Compiles both into a single class at runtime"),
                    "Throws BeanCurrentlyInCreationException unless @Lazy or setter injection is configured",
                    "Constructor-injected circular dependencies prevent either bean from completing initialization, causing Spring to fail fast with BeanCurrentlyInCreationException. Using @Lazy defers initialization via a CGLIB proxy.", "HARD", "Spring IoC & Architecture");

            addQ(c, "In Java 21, what is the primary architectural advantage of Virtual Threads (Project Loom) over traditional Platform Threads?",
                    List.of("Virtual threads are lightweight user-mode threads scheduled by the JVM, allowing millions of concurrent tasks with minimal OS thread overhead",
                            "Virtual threads bypass Java garbage collection completely",
                            "Virtual threads execute code in C++ directly without bytecode",
                            "Virtual threads guarantee lock-free database operations"),
                    "Virtual threads are lightweight user-mode threads scheduled by the JVM, allowing millions of concurrent tasks with minimal OS thread overhead",
                    "Virtual threads decouple Java thread count from OS kernel threads, eliminating expensive thread context-switching and enabling massive I/O concurrency.", "MEDIUM", "Java Concurrency & Loom");

            addQ(c, "In a React 18 frontend connected to a Spring Boot REST API, what does the useEffect cleanup return function prevent?",
                    List.of("Memory leaks, stale state updates on unmounted components, and duplicate WebSocket/event subscriptions",
                            "Browser crashes on CSS compile",
                            "SQL injection on frontend forms",
                            "Spring Boot connection timeouts"),
                    "Memory leaks, stale state updates on unmounted components, and duplicate WebSocket/event subscriptions",
                    "The cleanup function returned by useEffect executes before the component unmounts or before the effect re-runs, cancelling pending fetches (AbortController) and removing event listeners.", "EASY", "React Component Lifecycle");

            addQ(c, "In Spring Data JPA, what causes the notorious 'N+1 Query Problem' and what is the standard production solution?",
                    List.of("Fetching a list of N parent entities triggers N additional queries for each child association; resolved using JOIN FETCH or @EntityGraph",
                            "Inserting N entities requires N transactions; resolved using batch size 1",
                            "Database deadlocks on high concurrency; resolved using HikariCP",
                            "SQL syntax errors on null columns; resolved with COALESCE"),
                    "Fetching a list of N parent entities triggers N additional queries for each child association; resolved using JOIN FETCH or @EntityGraph",
                    "When lazy associations are accessed inside a loop, Hibernate issues 1 query for parents and N queries for children. JOIN FETCH or @EntityGraph fetches parents and children in a single SQL JOIN.", "MEDIUM", "JPA & Hibernate Performance");

            addQ(c, "What is the difference between @ControllerAdvice and @ExceptionHandler in Spring Boot REST applications?",
                    List.of("@ControllerAdvice defines a global interceptor across all controllers; @ExceptionHandler defines the specific handler method for target exceptions",
                            "@ControllerAdvice is only for HTML views; @ExceptionHandler is for JSON",
                            "@ControllerAdvice restarts the server on fatal errors",
                            "They are identical in scope and behavior"),
                    "@ControllerAdvice defines a global interceptor across all controllers; @ExceptionHandler defines the specific handler method for target exceptions",
                    "@ControllerAdvice (or @RestControllerAdvice) applies global AOP exception handling across all REST endpoints, routing thrown exceptions to annotated @ExceptionHandler methods.", "EASY", "Spring REST Error Handling");

            addQ(c, "In Java, how does the Garbage Collector distinguish between live objects and unreachable objects using GC Roots?",
                    List.of("Traces reference chains starting from GC Roots (stack frames, static variables, JNI references); unvisited objects are marked for sweep",
                            "Maintains an atomic reference counter per object",
                            "Checks file timestamps on disk",
                            "Deletes objects after 60 seconds automatically"),
                    "Traces reference chains starting from GC Roots (stack frames, static variables, JNI references); unvisited objects are marked for sweep",
                    "Modern JVM GCs (G1, ZGC) perform tracing reachability analysis from GC Roots to avoid memory leaks caused by circular reference islands.", "MEDIUM", "JVM Internals & Memory");

            addQ(c, "In a React SPA, what is the key difference between optimistic UI updates and pessimistic UI updates when communicating with a Spring backend?",
                    List.of("Optimistic immediately renders the expected state before server response and rolls back on failure; pessimistic waits for server HTTP 200 before updating UI",
                            "Optimistic uses WebSockets; pessimistic uses HTTP GET",
                            "Optimistic only works on mobile browsers",
                            "Pessimistic disables React re-rendering"),
                    "Optimistic immediately renders the expected state before server response and rolls back on failure; pessimistic waits for server HTTP 200 before updating UI",
                    "Optimistic updates deliver instant perceived responsiveness by assuming backend success, whereas pessimistic updates display loading spinners until server confirmation.", "MEDIUM", "Frontend Architecture & UX");

            addQ(c, "In Spring Security, why should sensitive passwords be hashed using BCrypt or Argon2 instead of SHA-256 or MD5?",
                    List.of("BCrypt incorporates a salt and configurable work factor (cost) to defend against GPU brute-force and rainbow table attacks",
                            "SHA-256 is not supported in Java 17",
                            "MD5 causes database connection timeouts",
                            "BCrypt allows two-way decryption on forgotten password requests"),
                    "BCrypt incorporates a salt and configurable work factor (cost) to defend against GPU brute-force and rainbow table attacks",
                    "Fast general-purpose cryptographic hashes like SHA-256 can be brute-forced billions of times per second on GPUs. Slow, salted key-derivation functions like BCrypt resist modern hardware attacks.", "EASY", "Enterprise Security & Auth");

            addQ(c, "In SQL and PostgreSQL, what is the practical purpose of a Database B-Tree Composite Index on (department_id, year_of_study)?",
                    List.of("Accelerates queries filtering by (department_id) alone or (department_id AND year_of_study), following left-to-right prefix matching",
                            "Accelerates queries filtering only on year_of_study",
                            "Compresses table storage by 50%",
                            "Enforces foreign key cascades automatically"),
                    "Accelerates queries filtering by (department_id) alone or (department_id AND year_of_study), following left-to-right prefix matching",
                    "Composite indexes satisfy queries that match the leading column(s) in order. Queries filtering solely on the second column without the first cannot utilize standard B-tree index traversal.", "HARD", "Database Indexing & Tuning");

            addQ(c, "In Spring Boot, what does @Transactional(propagation = Propagation.REQUIRES_NEW) execute?",
                    List.of("Suspends any existing transaction and starts a completely independent, isolated physical database transaction",
                            "Joins the current transaction if one exists",
                            "Executes without any transaction context",
                            "Rolls back both parent and child transactions unconditionally"),
                    "Suspends any existing transaction and starts a completely independent, isolated physical database transaction",
                    "REQUIRES_NEW creates an independent transaction boundary. If the inner transaction succeeds and commits, outer transaction rollback will not affect it (e.g. for audit logging).", "HARD", "Spring Transaction Management");

            addQ(c, "In Java, what occurs when two threads simultaneously invoke synchronized methods on different instances of the same class?",
                    List.of("Both threads execute concurrently without blocking because each lock is acquired on the respective instance monitor ('this')",
                            "One thread blocks until the other finishes",
                            "A DeadlockException is thrown",
                            "The JVM serializes thread execution globally"),
                    "Both threads execute concurrently without blocking because each lock is acquired on the respective instance monitor ('this')",
                    "Instance synchronized methods synchronize on the specific object instance (`this`). Threads invoking methods on different objects hold distinct monitor locks and execute in parallel.", "MEDIUM", "Java Multithreading");

            addQ(c, "In modern REST APIs, why is the HTTP PUT method specified as idempotent, while HTTP POST is typically non-idempotent?",
                    List.of("Executing PUT N times with the same payload produces the same target resource state as executing it once; POST repeatedly creates new sub-resources",
                            "POST can only be called once per session",
                            "PUT encrypts payloads automatically",
                            "POST requires SSL certificates while PUT does not"),
                    "Executing PUT N times with the same payload produces the same target resource state as executing it once; POST repeatedly creates new sub-resources",
                    "Idempotence guarantees that repeated identical requests leave system state unaltered. Multiple PUT requests overwrite resource state consistently; multiple POST requests create multiple duplicate records.", "EASY", "REST API Design Standards");

            addQ(c, "In a React and Spring Boot full-stack architecture, what triggers a CORS (Cross-Origin Resource Sharing) Preflight OPTIONS request?",
                    List.of("Non-simple HTTP methods (PUT, DELETE, PATCH) or custom headers (like Authorization: Bearer <token>) sent to a different origin",
                            "GET requests with query parameters",
                            "Images loaded via <img> tags",
                            "Form submissions using application/x-www-form-urlencoded"),
                    "Non-simple HTTP methods (PUT, DELETE, PATCH) or custom headers (like Authorization: Bearer <token>) sent to a different origin",
                    "Browsers dispatch an automatic preflight HTTP OPTIONS request to check Access-Control-Allow-Methods and Access-Control-Allow-Headers before executing non-simple cross-origin requests.", "MEDIUM", "Full-Stack Web Security");

            addQ(c, "In Hibernate/JPA, how does Optimistic Locking using the @Version annotation prevent lost updates in concurrent environments?",
                    List.of("Checks version number during UPDATE; if another transaction incremented it, throws OptimisticLockException without holding database table locks",
                            "Acquires an exclusive SELECT ... FOR UPDATE database lock on read",
                            "Blocks all other HTTP requests until transaction completes",
                            "Reverts database to yesterday's snapshot"),
                    "Checks version number during UPDATE; if another transaction incremented it, throws OptimisticLockException without holding database table locks",
                    "Optimistic locking assumes collisions are rare. When committing, it executes `UPDATE ... WHERE id=? AND version=?`. If 0 rows are updated, someone else modified the entity, throwing OptimisticLockException.", "HARD", "JPA Concurrency Control");

            addQ(c, "In a Spring Boot microservice environment, what is the role of a distributed Cache-Aside (Lazy-Loading) pattern using Redis?",
                    List.of("Application queries Redis cache first; on cache miss, reads from PostgreSQL, populates Redis, and returns the result",
                            "Redis automatically replicates all SQL tables into memory",
                            "Redis replaces Spring Data JPA entirely",
                            "Application writes to disk before memory"),
                    "Application queries Redis cache first; on cache miss, reads from PostgreSQL, populates Redis, and returns the result",
                    "Cache-Aside minimizes primary database read pressure by populating memory keys on-demand upon cache misses, invalidating them when source data updates.", "MEDIUM", "Distributed Caching");

            addQ(c, "In Java, what is the crucial functional difference between Comparable<T> and Comparator<T>?",
                    List.of("Comparable imposes natural ordering on the class itself via compareTo(); Comparator provides custom external sorting strategies via compare()",
                            "Comparable is only for Strings; Comparator is for Integers",
                            "Comparator cannot be used with Collections.sort()",
                            "Comparable is deprecated in Java 21"),
                    "Comparable imposes natural ordering on the class itself via compareTo(); Comparator provides custom external sorting strategies via compare()",
                    "Implementing Comparable defines the natural ordering of a class (e.g. Student sorted by roll number). Comparator allows multiple distinct sort orders (by name, by CGPA, by date) without altering class source.", "EASY", "Java Collections & Generics");

            addQ(c, "In React 18, what is the purpose of the useMemo hook?",
                    List.of("Caches the computed result of an expensive calculation between re-renders, recomputing only when specified dependencies change",
                            "Persists state into the browser's localStorage",
                            "Prevents components from unmounting",
                            "Performs asynchronous API calls on initial load"),
                    "Caches the computed result of an expensive calculation between re-renders, recomputing only when specified dependencies change",
                    "useMemo memoizes CPU-heavy computations so they do not execute unnecessarily on every parent re-render unless input dependencies mutate.", "EASY", "React Performance Optimization");

            addQ(c, "In database design, what does the ACID property 'Isolation' guarantee?",
                    List.of("Concurrent transactions execute without interfering with one another, preventing dirty reads and non-repeatable reads according to the isolation level",
                            "Data is immediately written to persistent SSD storage",
                            "Database operations succeed completely or leave data unmodified",
                            "Constraints like foreign keys are never violated"),
                    "Concurrent transactions execute without interfering with one another, preventing dirty reads and non-repeatable reads according to the isolation level",
                    "Isolation controls transaction visibility and concurrency anomalies (Dirty Read, Non-repeatable Read, Phantom Read) via isolation levels (READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE).", "MEDIUM", "Relational Database Theory");

            addQ(c, "In Spring Boot, how does the HikariCP connection pool handle connection leaks when connections are not returned to the pool?",
                    List.of("Throws connection timeout exceptions when pool is exhausted; leakDetectionThreshold can be set to log stack traces of unclosed connections",
                            "Spawns infinite connections until OS memory fails",
                            "Silently deletes unclosed database transactions",
                            "Restarts the Tomcat web server"),
                    "Throws connection timeout exceptions when pool is exhausted; leakDetectionThreshold can be set to log stack traces of unclosed connections",
                    "HikariCP bounds maximum pool size. If applications fail to close connections (e.g. unclosed ResultSets or leaked sessions), the pool exhausts. Configuring leakDetectionThreshold logs warnings with exact caller stack traces.", "MEDIUM", "Database Connection Pooling");

            addQ(c, "What is the primary architectural benefit of designing Spring Boot APIs with Data Transfer Objects (DTOs) rather than returning JPA Entities directly?",
                    List.of("Prevents sensitive field leakage, eliminates Jackson circular serialization recursion on bidirectional relations, and decouples DB schema from public API contracts",
                            "Increases database query throughput by 10x",
                            "Eliminates the need for Spring Security filters",
                            "Automatically translates Java into TypeScript"),
                    "Prevents sensitive field leakage, eliminates Jackson circular serialization recursion on bidirectional relations, and decouples DB schema from public API contracts",
                    "DTOs decouple the external API contract from internal database persistence. They stop infinite recursion (parent -> child -> parent), prevent accidental exposure of password hashes/tokens, and enable precise input validation.", "EASY", "Enterprise Software Architecture");
        }
    }

    private void copyQuestionsFromCategory(String sourceCategoryName, String targetCategoryName, int maxQuestions) {
        TestCategory targetCat = categoryRepository.findByName(targetCategoryName).orElseGet(() -> {
            TestCategory newCat = new TestCategory(targetCategoryName, "MOCK", "Practice", "Calibrated mock assessment.");
            return categoryRepository.save(newCat);
        });

        TestCategory sourceCat = categoryRepository.findByName(sourceCategoryName).orElse(null);
        if (sourceCat == null) return;

        List<Question> sourceQuestions = questionRepository.findByTestCategoryId(sourceCat.getId());
        int added = 0;
        for (Question sq : sourceQuestions) {
            if (added >= maxQuestions) break;
            Optional<Question> existing = questionRepository.findByTestCategoryIdAndQuestionText(targetCat.getId(), sq.getQuestionText());
            if (existing.isEmpty()) {
                Question q = new Question();
                q.setTestCategoryId(targetCat.getId());
                q.setQuestionText(sq.getQuestionText());
                q.setOptions(sq.getOptions());
                q.setCorrectAnswer(sq.getCorrectAnswer());
                q.setExplanation(sq.getExplanation());
                q.setDifficulty(sq.getDifficulty());
                q.setTopic(sq.getTopic());
                q.setMarks(sq.getMarks() != null ? sq.getMarks() : 1);
                q.setNegativeMarks(sq.getNegativeMarks() != null ? sq.getNegativeMarks() : 0.25);
                questionRepository.save(q);
                added++;
            }
        }
    }

    private void seedMernMock() {
        String c = "MERN Stack Mock Assessment";
        copyQuestionsFromCategory("Node.js & Backend Architecture", c, 10);
        copyQuestionsFromCategory("Web Frontend & React", c, 10);
    }

    private void seedAiMlMock() {
        String c = "AI / ML Engineering Mock Assessment";
        copyQuestionsFromCategory("Machine Learning & Python", c, 20);
    }

    private void seedDataAnalyticsMock() {
        String c = "Data Analytics & BI Mock Assessment";
        copyQuestionsFromCategory("Data Analytics & BI (SQL/Tableau)", c, 20);
    }
}
