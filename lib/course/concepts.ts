import type { Concept, Module } from "./types"

export const modules: Module[] = [
  {
    id: "linear",
    title: "Linear regression",
    courseName: "Linear regression",
  },
  {
    id: "datasets",
    title: "Datasets and generalization",
    courseName: "Datasets, generalization, and overfitting",
  },
  {
    id: "logistic",
    title: "Logistic regression",
    courseName: "Logistic regression",
  },
  {
    id: "classification",
    title: "Classification",
    courseName: "Classification",
  },
  {
    id: "categorical",
    title: "Categorical data",
    courseName: "Working with categorical data",
  },
  {
    id: "nets",
    title: "Neural networks and embeddings",
    courseName: "Neural networks and embeddings",
  },
]

export const concepts: Concept[] = [
  {
    id: "examples",
    title: "Examples and labels",
    moduleId: "linear",
    summary:
      "An example is one row. The label is the answer column the model is graded against.",
    paragraphs: [
      "An example is a single case. In a table, that is one row. The label is the answer for that row: the price, the yes or no, the thing you wish you had known ahead of time.",
      "The label is not just another column. The model is scored by how close it comes to the label. If the label leaks into the inputs, the model is being handed the answer column and the check is meaningless.",
    ],
    hold: "One row is an example. The answer column is the label.",
    prereqs: [],
  },
  {
    id: "features",
    title: "Features",
    moduleId: "linear",
    summary:
      "A feature is an input column the model may use. It is not the label.",
    paragraphs: [
      "Features are the inputs. They are the columns the model is allowed to see when it makes a prediction. The label stays hidden at prediction time.",
      "A useful feature changes when the thing you are predicting changes. A column that is constant, or a copy of the label under another name, does not help. It either says nothing or it cheats.",
    ],
    hold: "Features are input columns. The label is not a feature.",
    prereqs: ["examples"],
  },
  {
    id: "linear",
    title: "Linear models",
    moduleId: "linear",
    summary:
      "A linear model predicts with a weighted sum of the features plus a bias term.",
    paragraphs: [
      "A linear model is a weighted sum. Each feature is multiplied by its own weight, the products are added, and a bias term shifts the result up or down. That total is the prediction.",
      "The weights are what training changes. A larger weight means that feature pulls the prediction harder. The bias term is the prediction you would make if every feature were zero.",
    ],
    hold: "Prediction equals a weighted sum of features, plus a bias term.",
    prereqs: ["examples", "features"],
  },
  {
    id: "loss",
    title: "Loss",
    moduleId: "linear",
    summary:
      "Loss measures how wrong one prediction is. Squared error is the usual loss for a number.",
    paragraphs: [
      "Loss is a number for how wrong a prediction is. For a model that predicts a number, squared error is the usual choice: the gap between prediction and label, squared, so that being off by a lot hurts more than being off by a little.",
      "Training does not stare at one row. It watches the average loss across the examples it is allowed to learn from. Lower average loss means the predictions are closer to the labels.",
    ],
    hold: "Loss measures how wrong the prediction is. Squared error squares the gap.",
    prereqs: ["examples", "linear"],
  },
  {
    id: "gradient",
    title: "Gradients",
    moduleId: "linear",
    summary:
      "The gradient is the slope of the loss. It points toward the steepest climb, not the way down.",
    paragraphs: [
      "Change a weight a tiny bit and the loss changes. The gradient collects those slopes, one per weight. It points toward the steepest climb in loss.",
      "That direction is the opposite of what training wants. If you follow the gradient, the model gets worse. The useful direction is downhill, against the gradient.",
    ],
    hold: "The gradient is the steepest climb of the loss. Training walks the other way.",
    prereqs: ["loss", "linear"],
  },
  {
    id: "learning-rate",
    title: "Learning rate",
    moduleId: "linear",
    summary:
      "The learning rate is the step size. Too large a step makes loss bounce or climb.",
    paragraphs: [
      "The learning rate decides how far the weights move on each update. It is a step size, not a direction. The gradient supplies the direction. The learning rate supplies the length.",
      "Too large a step jumps over the bottom. Loss bounces or climbs. Too small a step is safe and slow. The weights barely move, and training looks stuck.",
    ],
    hold: "Learning rate is step size. Too large a step makes loss bounce.",
    prereqs: ["gradient"],
  },
  {
    id: "descent",
    title: "Gradient descent",
    moduleId: "linear",
    summary:
      "Gradient descent repeats an update: step the weights opposite the gradient, scaled by the step size.",
    paragraphs: [
      "Gradient descent is the loop. Measure the loss, compute the gradient, then move each weight opposite the gradient. Multiply that move by the learning rate so the step has a chosen length.",
      "One step is not training. You repeat the update. After enough repeats, the loss should be lower than where you started, unless the step size is wild or the loss is the wrong measure.",
    ],
    hold: "Repeat: step opposite the gradient, using the learning rate as the step size.",
    prereqs: ["gradient", "learning-rate"],
  },
  {
    id: "tuning",
    title: "Hyperparameter tuning",
    moduleId: "linear",
    summary:
      "A hyperparameter is a knob you choose, such as step size. Training does not learn that knob for you.",
    paragraphs: [
      "Weights are learned. The learning rate is not. A hyperparameter is a knob you set before training, or between training runs. The step size is the first knob most people meet.",
      "You compare choices by training more than once and seeing which run ends with lower loss on examples that were not used to take the steps. Picking the knob on the final test set wears that set out. It stops being an honest exam.",
    ],
    hold: "You choose the hyperparameter. The update loop does not learn it.",
    prereqs: ["descent", "learning-rate"],
  },
  {
    id: "splits",
    title: "Training and test sets",
    moduleId: "datasets",
    summary:
      "The training set is what the weights learn from. The test set is held out for an honest check.",
    paragraphs: [
      "The training set is the rows whose loss is allowed to move the weights. The model may see those labels while it learns.",
      "The test set is held out. You do not take gradient steps on it, and you do not keep tweaking the model until the test number looks good. Once you do that, it is no longer a test. It is just more training.",
    ],
    hold: "Train on the training set. Keep the test set held out.",
    prereqs: ["examples"],
  },
  {
    id: "generalization",
    title: "Generalization",
    moduleId: "datasets",
    summary:
      "Generalization means doing well on new examples from the same kind of data, not only on the training rows.",
    paragraphs: [
      "A model generalizes when its predictions hold on new examples, drawn from the same kind of data, that it did not train on. The test set is how you estimate that, if you have actually kept it held out.",
      "Low loss on the training set is not the same claim. The model has already used those labels. The question is whether the pattern travels.",
    ],
    hold: "Generalization is success on new examples, not a low training loss.",
    prereqs: ["splits"],
  },
  {
    id: "overfitting",
    title: "Overfitting",
    moduleId: "datasets",
    summary:
      "Overfitting is when the model memorized. Training loss looks great and new examples look bad.",
    paragraphs: [
      "Overfitting means the model fit the training rows too tightly, including their quirks. Training loss looks great. On new examples, loss is much worse.",
      "You notice it by comparing the two, which only works if a test set or a validation set was held out. A single training loss number cannot show memorization, because memorization makes that number look wonderful.",
    ],
    hold: "Memorized training rows, weak on new examples: that is overfitting.",
    prereqs: ["generalization", "loss"],
  },
  {
    id: "regularization",
    title: "Regularization",
    moduleId: "datasets",
    summary:
      "Regularization adds a penalty for large weights so the model is less free to memorize.",
    paragraphs: [
      "Regularization changes the objective. Besides measuring how wrong the predictions are, you add a penalty for large weights. Huge weights are a common way to memorize odd rows.",
      "The penalty is a trade. Training loss on the labels may get a little worse. The hope is that new examples get better, because the model is less free to memorize. It is a knob, not a promise.",
    ],
    hold: "A penalty for large weights pushes the model away from memorizing.",
    prereqs: ["overfitting", "linear", "loss"],
  },
  {
    id: "sigmoid",
    title: "Sigmoid",
    moduleId: "logistic",
    summary:
      "A sigmoid squashes any score into a number between 0 and 1.",
    paragraphs: [
      "A linear model can output any number, including 14 or negative 3. A probability cannot. A sigmoid squashes a score into a value between 0 and 1.",
      "Large positive scores land near 1. Large negative scores land near 0. The middle score, zero, lands at one half. The squash is smooth, which is what lets a gradient flow through it.",
    ],
    hold: "A sigmoid squashes a score into a number between 0 and 1.",
    prereqs: ["linear"],
  },
  {
    id: "log-loss",
    title: "Log loss",
    moduleId: "logistic",
    summary:
      "Log loss is the penalty for probabilities. Being confidently wrong costs a great deal.",
    paragraphs: [
      "Once the output is a probability and the label is yes or no, squared error is an awkward fit. Log loss is the penalty built for probabilities. It asks: how much probability did you put on the label that actually happened?",
      "Being confidently wrong is the expensive case. Predicting 0.01 when the label is yes costs far more than predicting 0.4. Being confidently right costs almost nothing.",
    ],
    hold: "Log loss punishes a probability that is confidently wrong.",
    prereqs: ["loss", "sigmoid"],
  },
  {
    id: "logistic",
    title: "Logistic regression",
    moduleId: "logistic",
    summary:
      "Logistic regression passes a linear score through a sigmoid and trains it with log loss.",
    paragraphs: [
      "Logistic regression is a linear score passed through a sigmoid. The weights still form a weighted sum plus a bias term. The sigmoid turns that score into a probability.",
      "Training uses log loss, not squared error. Gradient descent still applies: the gradient is the slope of that log loss, and the learning rate is still the step size.",
    ],
    hold: "A linear score, squashed by a sigmoid, trained with log loss.",
    prereqs: ["log-loss", "linear", "sigmoid"],
  },
  {
    id: "threshold",
    title: "Classification threshold",
    moduleId: "classification",
    summary:
      "A threshold is the cutoff where a probability becomes a yes or no call.",
    paragraphs: [
      "A probability is not yet a decision. A threshold is the cutoff. At or above it, you call the example positive. Below it, you call it negative.",
      "One half is a common default, not a law. If missing a positive case is expensive, you lower the cutoff and call more things positive. If false alarms are expensive, you raise it.",
    ],
    hold: "The threshold is the cutoff that turns a probability into a call.",
    prereqs: ["logistic"],
  },
  {
    id: "precision-recall",
    title: "Precision and recall",
    moduleId: "classification",
    summary:
      "Precision looks among the ones you called positive. Recall looks among the real positives.",
    paragraphs: [
      "Precision answers: of the examples you called positive, how many truly were? A flood of false alarms drives precision down.",
      "Recall answers: of the real positives, how many did you catch? Missing true cases drives recall down. Moving the threshold usually lifts one and drops the other. Accuracy can hide that trade when one class is rare.",
    ],
    hold: "Precision is about your positive calls. Recall is about the real positives.",
    prereqs: ["threshold", "examples"],
  },
  {
    id: "categorical",
    title: "Categorical features",
    moduleId: "categorical",
    summary:
      "A categorical feature has values that are names. They are not amounts you can average.",
    paragraphs: [
      "Some columns are amounts: age, temperature, price. A categorical feature has values that are names: a city, a color, a product type. The names do not have a size order unless you have a real reason to impose one.",
      "Feeding the names in as if they were numbers is a quiet bug. The model will treat code 3 as three times code 1. Nothing about the names promised that.",
    ],
    hold: "Categorical values are names, not amounts.",
    prereqs: ["features"],
  },
  {
    id: "one-hot",
    title: "One-hot encoding",
    moduleId: "categorical",
    summary:
      "One-hot encoding makes one column per category, with a single 1 in the matching column.",
    paragraphs: [
      "One-hot encoding gives each category its own column. The row for a category has a 1 in that column and 0 in the others. The model can then put a separate weight on each name.",
      "It stops the model from inventing an order between names. The cost is width. A feature with a million names would like a million columns, which is a reason to reach for something denser later.",
    ],
    hold: "One column per category, a single 1 in the column that matches.",
    prereqs: ["categorical"],
  },
  {
    id: "crosses",
    title: "Feature crosses",
    moduleId: "categorical",
    summary:
      "A feature cross combines two columns, so city and hour together can have their own weight.",
    paragraphs: [
      "A linear model can add the effect of city and the effect of hour. It cannot, by itself, say that the hour matters differently in each city. A feature cross builds the combination as its own column, and that column gets its own weight.",
      "Crosses are how a weighted sum represents an interaction. They multiply the width of the data again, especially when both sides are one-hot columns.",
    ],
    hold: "A cross lets a pair of features share a weight a weighted sum could not learn from either one alone.",
    prereqs: ["one-hot", "linear"],
  },
  {
    id: "hidden",
    title: "Hidden layers",
    moduleId: "nets",
    summary:
      "A hidden layer computes intermediate values that later units use as features.",
    paragraphs: [
      "A hidden layer sits between the input and the prediction. Each unit is its own weighted sum of what came in. The next layer treats those results as features.",
      "The layer is called hidden because those intermediate values are not labels you wrote down. Training has to set their weights anyway, by following the slope of the loss back through the layer.",
    ],
    hold: "Hidden units are intermediate weighted sums. Later units use them as features.",
    prereqs: ["linear", "descent"],
  },
  {
    id: "activation",
    title: "Activation functions",
    moduleId: "nets",
    summary:
      "An activation is a bend after the weighted sum. Without that bend, stacking layers is still one linear model.",
    paragraphs: [
      "An activation is a bend applied after a unit's weighted sum. The sigmoid is one bend. There are others. The point of the bend is that it is not a straight line.",
      "Stack two linear layers with no bend and the math collapses. You still have one weighted sum, just with combined weights. The bend is what makes a hidden layer able to represent something a single linear model cannot.",
    ],
    hold: "Without a bend between layers, the stack is still one linear model.",
    prereqs: ["hidden"],
  },
  {
    id: "embedding",
    title: "Embeddings",
    moduleId: "nets",
    summary:
      "An embedding is a short list of learned numbers for a category, used when one column per category would be huge.",
    paragraphs: [
      "One-hot encoding wants one column per category. That falls over when there are hundreds of thousands of names. An embedding gives each category a short list of learned numbers instead.",
      "Those numbers are weights. Training moves them with the same kind of update that moves any other weight: opposite the gradient of the loss. Categories that play a similar role can end up with similar lists, because that similarity reduced the loss.",
    ],
    hold: "An embedding is a short learned vector for a category, trained through the loss.",
    prereqs: ["one-hot", "hidden"],
  },
]
