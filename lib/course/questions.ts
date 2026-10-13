import type { Question } from "./types"

function q(
  conceptId: string,
  n: number,
  prompt: string,
  because: string,
  correct: string,
  wrongs: [string, string][],
): Question {
  return {
    id: `${conceptId}-${n}`,
    conceptId,
    prompt,
    because,
    choices: [
      { text: correct, reveals: null },
      ...wrongs.map(([text, reveals]) => ({ text, reveals })),
    ],
  }
}

export const questions: Question[] = [
  q(
    "examples",
    1,
    "In a table the model learns from, what is the label?",
    "The label is the answer column the prediction is compared with.",
    "The answer column for that row, which the prediction is graded against.",
    [
      [
        "Any input column the model is allowed to see while predicting.",
        "features",
      ],
      [
        "The bias term added after the weighted sum.",
        "linear",
      ],
      [
        "The step size used on each update.",
        "learning-rate",
      ],
    ],
  ),
  q(
    "examples",
    2,
    "What is one example?",
    "An example is one row, inputs together with the label.",
    "One row: the inputs for a single case, plus its label.",
    [
      [
        "The whole test set, held out from training.",
        "splits",
      ],
      [
        "The slope of the loss for one weight.",
        "gradient",
      ],
      [
        "A column of names, one name per category.",
        "categorical",
      ],
    ],
  ),
  q(
    "features",
    1,
    "Which column is safe to use as a feature?",
    "A feature is an input column, and it must not be the label.",
    "An input column that the model can see without being handed the label.",
    [
      [
        "The answer column, because the model should start from the truth.",
        "examples",
      ],
      [
        "The squared error of the previous prediction.",
        "loss",
      ],
      [
        "The cutoff that turns a probability into a yes or no.",
        "threshold",
      ],
    ],
  ),
  q(
    "features",
    2,
    "A column has the same number on every row. What is it worth as a feature?",
    "A constant input column does not help separate one label from another.",
    "Nothing useful. It cannot explain why the label changes from row to row.",
    [
      [
        "It is the best feature, because the weighted sum stays stable.",
        "linear",
      ],
      [
        "It is the label, because labels are constant by definition.",
        "examples",
      ],
      [
        "It is a penalty for large weights.",
        "regularization",
      ],
    ],
  ),
  q(
    "linear",
    1,
    "How does a linear model turn features into a prediction?",
    "It multiplies each feature by a weight, adds them, and adds a bias term.",
    "A weighted sum of the features, plus a bias term.",
    [
      [
        "It copies the answer column into the output.",
        "examples",
      ],
      [
        "It squashes a score into a number between 0 and 1.",
        "sigmoid",
      ],
      [
        "It averages the training loss and calls that the prediction.",
        "loss",
      ],
    ],
  ),
  q(
    "linear",
    2,
    "What does the bias term do?",
    "The bias term is the shift you get even when every feature is zero.",
    "It shifts the weighted sum, including the prediction you make when every feature is zero.",
    [
      [
        "It is the step size of gradient descent.",
        "learning-rate",
      ],
      [
        "It is the slope of the loss, one entry per weight.",
        "gradient",
      ],
      [
        "It marks which rows belong to the test set.",
        "splits",
      ],
    ],
  ),
  q(
    "loss",
    1,
    "For a model that predicts a number, what does squared error measure?",
    "Squared error is the gap between prediction and label, squared.",
    "How wrong the prediction is: the gap to the label, squared.",
    [
      [
        "How large the step size is.",
        "learning-rate",
      ],
      [
        "Whether the row belongs in the held out test set.",
        "splits",
      ],
      [
        "How many input columns the weighted sum uses.",
        "features",
      ],
    ],
  ),
  q(
    "loss",
    2,
    "Training watches the average loss rather than a single row because…",
    "One row is not the objective. The average says how wrong the model is across the examples.",
    "One row can look fine while the model is wrong on the rest of the examples.",
    [
      [
        "The gradient only exists for an average, never for one row.",
        "gradient",
      ],
      [
        "The bias term is defined as the average of the labels.",
        "linear",
      ],
      [
        "A sigmoid only squashes averages, not single scores.",
        "sigmoid",
      ],
    ],
  ),
  q(
    "gradient",
    1,
    "Which way does the gradient point?",
    "The gradient points toward the steepest climb in loss.",
    "Toward the steepest climb in the loss, which is the direction that makes predictions more wrong.",
    [
      [
        "Toward a smaller step size, regardless of the slope.",
        "learning-rate",
      ],
      [
        "Toward the answer column, so the label can be copied.",
        "examples",
      ],
      [
        "Toward the held out test set.",
        "splits",
      ],
    ],
  ),
  q(
    "gradient",
    2,
    "You follow the gradient and take a step. What should you expect the loss to do, if the step is not tiny enough to be noise?",
    "Following the gradient climbs the loss. Training steps the other way.",
    "Loss should rise, because the gradient is the steepest climb, not the way down.",
    [
      [
        "Loss must fall, because every update is defined to reduce squared error.",
        "loss",
      ],
      [
        "The bias term resets to zero.",
        "linear",
      ],
      [
        "The test set becomes the training set.",
        "splits",
      ],
    ],
  ),
  q(
    "learning-rate",
    1,
    "Loss bounces and sometimes climbs during training. What is the first knob to suspect?",
    "A step size that is too large jumps past the bottom.",
    "The step size is too large for this loss surface.",
    [
      [
        "The gradient is being used as a step size instead of as a direction.",
        "gradient",
      ],
      [
        "Squared error is being replaced by the label column.",
        "loss",
      ],
      [
        "The weighted sum forgot its bias term.",
        "linear",
      ],
    ],
  ),
  q(
    "learning-rate",
    2,
    "What is the learning rate, in one sentence?",
    "It is the step size. The gradient is the direction.",
    "The step size. It scales the move and does not choose the direction.",
    [
      [
        "The steepest climb of the loss.",
        "gradient",
      ],
      [
        "The penalty for large weights.",
        "regularization",
      ],
      [
        "The cutoff that turns a probability into a call.",
        "threshold",
      ],
    ],
  ),
  q(
    "descent",
    1,
    "One update of gradient descent changes a weight by…",
    "The move is opposite the gradient, and the learning rate sets the length.",
    "A step opposite the gradient, with length set by the learning rate.",
    [
      [
        "Adding the answer column to the weight.",
        "examples",
      ],
      [
        "Adding the step size to the loss, with no change to the weights.",
        "learning-rate",
      ],
      [
        "Replacing the slope with the bias term.",
        "gradient",
      ],
    ],
  ),
  q(
    "descent",
    2,
    "Why is a single update not enough to call the model trained?",
    "Gradient descent is a loop. One step only moves a little, unless the step size is reckless.",
    "The procedure repeats the update so the loss can keep falling.",
    [
      [
        "Because squared error is undefined until the second step.",
        "loss",
      ],
      [
        "Because the test set must be copied into the training set first.",
        "splits",
      ],
      [
        "Because a weighted sum needs two bias terms.",
        "linear",
      ],
    ],
  ),
  q(
    "tuning",
    1,
    "Why is the learning rate a hyperparameter rather than just another weight?",
    "You choose the step size. The update loop learns weights, not that knob.",
    "You choose it. The update does not learn the step size the way it learns a weight.",
    [
      [
        "Because the steepest climb already contains the step size.",
        "gradient",
      ],
      [
        "Because squared error forbids any knob you set by hand.",
        "loss",
      ],
      [
        "Because the answer column is the only learned value.",
        "examples",
      ],
    ],
  ),
  q(
    "tuning",
    2,
    "You try three step sizes and keep the one with the best score on the final test set, then quote that score. What went wrong?",
    "Choosing a knob on the test set means the test set was not held out.",
    "The test set was used to pick the knob, so it is no longer an honest held out check.",
    [
      [
        "Nothing. The test set is the right place to choose the step size.",
        "splits",
      ],
      [
        "The gradient should have chosen the step size in one update.",
        "descent",
      ],
      [
        "Squared error cannot be compared across runs.",
        "loss",
      ],
    ],
  ),
  q(
    "splits",
    1,
    "Which rows is gradient descent allowed to learn from?",
    "Only the training set. The test set stays held out.",
    "The training set. The test set stays held out of the updates.",
    [
      [
        "Whichever rows have the largest squared error, including the test set.",
        "loss",
      ],
      [
        "The test set only, because those labels are the honest ones.",
        "generalization",
      ],
      [
        "The answer column, ignoring every input column.",
        "examples",
      ],
    ],
  ),
  q(
    "splits",
    2,
    "You keep editing the model until the test score looks good. What is the test set now?",
    "Once you tune on it, the test set is no longer held out.",
    "More training data. It stopped being held out.",
    [
      [
        "A purer test, because you saw the score.",
        "generalization",
      ],
      [
        "The learning rate.",
        "learning-rate",
      ],
      [
        "A feature cross of city and hour.",
        "crosses",
      ],
    ],
  ),
  q(
    "generalization",
    1,
    "A model generalizes when…",
    "Generalization is about new examples from the same kind of data.",
    "It does well on new examples from the same kind of data, not only on the rows it trained on.",
    [
      [
        "Its training loss is near zero, whether or not new examples were held out.",
        "loss",
      ],
      [
        "The step size is small enough that the loss never bounces.",
        "learning-rate",
      ],
      [
        "Every categorical value has been turned into an amount.",
        "categorical",
      ],
    ],
  ),
  q(
    "generalization",
    2,
    "Low loss on the training set does not, by itself, show generalization. Why not?",
    "Those labels were already used to move the weights.",
    "The training rows were already used to fit the weights, so that loss is not a check on new examples.",
    [
      [
        "Because squared error ignores the label.",
        "loss",
      ],
      [
        "Because a weighted sum cannot be evaluated on the training set.",
        "linear",
      ],
      [
        "Because the gradient points at the test set.",
        "gradient",
      ],
    ],
  ),
  q(
    "overfitting",
    1,
    "Which pattern is overfitting?",
    "Training loss looks great while new examples look bad. The model memorized.",
    "Training loss looks great, and new examples look much worse. The model memorized the training rows.",
    [
      [
        "Both training loss and loss on new examples are high.",
        "generalization",
      ],
      [
        "The step size is so small that training barely moves.",
        "learning-rate",
      ],
      [
        "The sigmoid outputs a number between 0 and 1.",
        "sigmoid",
      ],
    ],
  ),
  q(
    "overfitting",
    2,
    "Why can't the training loss alone tell you that the model memorized?",
    "Memorizing makes training loss look wonderful.",
    "Memorizing the training rows drives training loss down, so that number looks like success.",
    [
      [
        "Because squared error is only defined on the test set.",
        "loss",
      ],
      [
        "Because a held out test set is the same thing as the learning rate.",
        "splits",
      ],
      [
        "Because the bias term hides memorization inside the weighted sum.",
        "linear",
      ],
    ],
  ),
  q(
    "regularization",
    1,
    "What does a penalty for large weights change?",
    "The objective gains a cost for huge weights, which are a way to memorize.",
    "The training objective. Huge weights now cost something, on top of how wrong the predictions are.",
    [
      [
        "It deletes the held out test set.",
        "splits",
      ],
      [
        "It replaces the step size with the answer column.",
        "learning-rate",
      ],
      [
        "It removes the need to measure how wrong a prediction is.",
        "loss",
      ],
    ],
  ),
  q(
    "regularization",
    2,
    "A regularized model can have slightly worse training loss than an unregularized one and still be the better choice. Why?",
    "The point is new examples, not the lowest possible training loss.",
    "The penalty can stop the model from memorizing, which is what you wanted if new examples were suffering.",
    [
      [
        "Because training loss is not allowed to use squared error.",
        "loss",
      ],
      [
        "Because the steepest climb disappears once weights are penalized.",
        "gradient",
      ],
      [
        "Because one-hot columns cannot have weights.",
        "one-hot",
      ],
    ],
  ),
  q(
    "sigmoid",
    1,
    "A linear score is 8. What does a sigmoid do with it?",
    "A sigmoid squashes any score into a number between 0 and 1. A large positive score lands near 1.",
    "It squashes 8 into a number between 0 and 1, close to 1.",
    [
      [
        "It treats 8 as a step size and updates the weights.",
        "learning-rate",
      ],
      [
        "It squares the gap between 8 and the label.",
        "loss",
      ],
      [
        "It refuses the score, because a weighted sum cannot be that large.",
        "linear",
      ],
    ],
  ),
  q(
    "sigmoid",
    2,
    "Why put a sigmoid on a linear score when the label is yes or no?",
    "A probability has to sit between 0 and 1. A raw weighted sum does not.",
    "The raw weighted sum can be any number. A probability has to sit between 0 and 1.",
    [
      [
        "So the answer column can be copied through unchanged.",
        "examples",
      ],
      [
        "So the test set can stay inside the training loop.",
        "splits",
      ],
      [
        "So the steepest climb becomes the step size.",
        "gradient",
      ],
    ],
  ),
  q(
    "log-loss",
    1,
    "The label is yes. Which probability does log loss punish most?",
    "Log loss is the penalty for probabilities, and confidently wrong is the expensive case.",
    "0.01. The model was confidently wrong.",
    [
      [
        "0.99. High confidence is always punished.",
        "sigmoid",
      ],
      [
        "The squared error of the weight vector.",
        "loss",
      ],
      [
        "The learning rate, if the step size is below 1.",
        "learning-rate",
      ],
    ],
  ),
  q(
    "log-loss",
    2,
    "Why is squared error an awkward loss once the model outputs a probability for a yes or no label?",
    "Squared error does not specially punish a probability that is confidently wrong.",
    "You want a penalty for probabilities, especially for being confidently wrong. Squared error is built for numeric gaps.",
    [
      [
        "Squared error only works on a held out test set.",
        "splits",
      ],
      [
        "A weighted sum cannot be compared with a yes or no label at all, even after a squash.",
        "linear",
      ],
      [
        "The steepest climb is undefined for yes or no labels.",
        "gradient",
      ],
    ],
  ),
  q(
    "logistic",
    1,
    "What is logistic regression, stripped to its parts?",
    "A linear score goes through a sigmoid, and training uses log loss.",
    "A weighted sum plus a bias term, squashed by a sigmoid, trained with log loss.",
    [
      [
        "A weighted sum trained with squared error, with no squash.",
        "loss",
      ],
      [
        "A cutoff applied directly to an input column.",
        "threshold",
      ],
      [
        "A penalty for large weights and nothing else.",
        "regularization",
      ],
    ],
  ),
  q(
    "logistic",
    2,
    "Does gradient descent still apply to logistic regression?",
    "Yes. The gradient is the slope of the log loss, and the learning rate is still the step size.",
    "Yes. You still step opposite the gradient of the loss you chose, which here is log loss.",
    [
      [
        "No. A sigmoid deletes the slope, so there is nothing to step on.",
        "gradient",
      ],
      [
        "No. The step size is replaced by the answer column.",
        "examples",
      ],
      [
        "Only on the held out test set.",
        "splits",
      ],
    ],
  ),
  q(
    "threshold",
    1,
    "A model outputs 0.42. You still call the example positive. What did you do?",
    "You set the cutoff below 0.42. One half is not required.",
    "You used a cutoff at or below 0.42. The default of one half is not required.",
    [
      [
        "You computed log loss and treated it as a class.",
        "log-loss",
      ],
      [
        "You followed the steepest climb of the training loss.",
        "gradient",
      ],
      [
        "You one-hot encoded the probability.",
        "one-hot",
      ],
    ],
  ),
  q(
    "threshold",
    2,
    "Missing a real positive case is very expensive in this problem. Which way should the cutoff move?",
    "A lower cutoff calls more things positive, so fewer real positives are missed.",
    "Lower it, so more examples are called positive and fewer real positives slip through.",
    [
      [
        "Raise it toward 1, so only confident probabilities become calls.",
        "sigmoid",
      ],
      [
        "Delete the cutoff and ship the weighted sum as the decision.",
        "linear",
      ],
      [
        "Raise the step size until training loss hits zero.",
        "learning-rate",
      ],
    ],
  ),
  q(
    "precision-recall",
    1,
    "You call 20 examples positive. 5 of them really are. What is the precision?",
    "Precision looks among the ones you called positive.",
    "5 out of 20. Precision only looks at the examples you called positive.",
    [
      [
        "5 out of every real positive in the data. That ratio is recall.",
        "examples",
      ],
      [
        "The log loss, because a probability penalty is the same ratio.",
        "log-loss",
      ],
      [
        "The step size, because both are fractions of the loss.",
        "learning-rate",
      ],
    ],
  ),
  q(
    "precision-recall",
    2,
    "You lower the cutoff and start calling more examples positive. Recall rises. What often happens to precision, and why does the squash matter at all?",
    "The new calls include more false alarms, so precision often falls. The cutoff only makes sense because a sigmoid turned a score into a probability.",
    "Precision often falls, because more of the new positive calls are wrong. You only had a cutoff because a sigmoid squashed the linear score into a probability.",
    [
      [
        "Precision rises automatically, because squared error fell.",
        "loss",
      ],
      [
        "Both stay fixed, because a weighted sum has no cutoff.",
        "linear",
      ],
      [
        "Precision becomes log loss. They count the same mistakes.",
        "log-loss",
      ],
    ],
  ),
  q(
    "precision-recall",
    3,
    "Accuracy stays high while the model never catches the rare positive class. Which pair of ideas explains that trap?",
    "Accuracy can look fine when negatives dominate. Recall is the number that notices the missed positives, and it depends on the cutoff.",
    "Recall is low because the real positives were missed, often from a cutoff that almost never fires. Accuracy hid it.",
    [
      [
        "The training set was held out and the test set was used for updates.",
        "splits",
      ],
      [
        "The steepest climb of squared error replaced the probability.",
        "gradient",
      ],
      [
        "A penalty for large weights deleted the positive class.",
        "regularization",
      ],
    ],
  ),
  q(
    "categorical",
    1,
    "A column stores city names. What goes wrong if you feed those names to a linear model as the numbers 1, 2, 3?",
    "Names are not amounts. The weighted sum will pretend code 3 is three times code 1.",
    "The model treats the codes as amounts. Nothing about the names promised an order or a size.",
    [
      [
        "Nothing. A weighted sum requires every input column to be a code.",
        "linear",
      ],
      [
        "The answer column becomes a city.",
        "examples",
      ],
      [
        "Squared error can no longer be computed.",
        "loss",
      ],
    ],
  ),
  q(
    "categorical",
    2,
    "Which of these is a categorical feature?",
    "Categorical values are names, not amounts.",
    "Product type, stored as words like shoe or hat.",
    [
      [
        "Price in dollars.",
        "features",
      ],
      [
        "The squared error of one prediction.",
        "loss",
      ],
      [
        "The step size.",
        "learning-rate",
      ],
    ],
  ),
  q(
    "one-hot",
    1,
    "A categorical feature has the values red, blue, and green. What does one-hot encoding produce?",
    "One column per category, with a single 1 in the matching column.",
    "Three columns. A red row has a 1 in the red column and 0 in the other two.",
    [
      [
        "One column of amounts: red = 1, blue = 2, green = 3.",
        "categorical",
      ],
      [
        "A short list of learned numbers for each color, trained through the loss.",
        "embedding",
      ],
      [
        "A sigmoid squash of the color name into a probability.",
        "sigmoid",
      ],
    ],
  ),
  q(
    "one-hot",
    2,
    "Why prefer one column per category over numbering the names?",
    "Separate columns let each name have its own weight, with no fake order.",
    "Each name gets its own weight. The model is not told that one name is larger than another.",
    [
      [
        "Because a weighted sum cannot multiply a column that contains a 1.",
        "linear",
      ],
      [
        "Because the answer column must be one-hot before any loss exists.",
        "examples",
      ],
      [
        "Because the step size only accepts zeros and ones.",
        "learning-rate",
      ],
    ],
  ),
  q(
    "crosses",
    1,
    "City and hour each have a weight. Predictions are still bad because morning in one city behaves nothing like morning in another. What is missing?",
    "A feature cross so the combination can have its own weight.",
    "A cross of city and hour, so that pair can have its own weight instead of two independent weights.",
    [
      [
        "A larger step size. The gradient has not been given enough length.",
        "learning-rate",
      ],
      [
        "Squared error. The weighted sum has not been told how wrong it is.",
        "loss",
      ],
      [
        "A held out test set inside the weighted sum.",
        "splits",
      ],
    ],
  ),
  q(
    "crosses",
    2,
    "Why can't a plain weighted sum learn that hour matters differently in each city, if city and hour are separate columns?",
    "Separate weights only add. They do not give the pair its own effect.",
    "Each column only adds its own effect. The pair never gets a weight of its own.",
    [
      [
        "Because one-hot encoding deletes the hour column.",
        "one-hot",
      ],
      [
        "Because names cannot enter a weighted sum even after one column per category.",
        "categorical",
      ],
      [
        "Because the steepest climb ignores input columns.",
        "gradient",
      ],
    ],
  ),
  q(
    "hidden",
    1,
    "What is a hidden unit?",
    "An intermediate weighted sum. Later units use those values as features.",
    "An intermediate weighted sum. The next layer uses that value as a feature.",
    [
      [
        "The answer column, stored inside the network.",
        "examples",
      ],
      [
        "The step size, copied into every layer.",
        "learning-rate",
      ],
      [
        "A replacement for measuring how wrong the prediction is.",
        "loss",
      ],
    ],
  ),
  q(
    "hidden",
    2,
    "Hidden units are not labels you wrote down. How do their weights still get updated?",
    "The slope of the loss is followed back through the layer.",
    "Training follows the slope of the loss back through the layer and steps those weights too.",
    [
      [
        "They are copied from the answer column at the start and then frozen.",
        "examples",
      ],
      [
        "The held out test set writes them directly.",
        "splits",
      ],
      [
        "A penalty for large weights sets them all to zero and stops.",
        "regularization",
      ],
    ],
  ),
  q(
    "activation",
    1,
    "You stack two weighted sums and put no bend between them. What model do you actually have?",
    "Without a bend, stacking layers collapses into one linear model.",
    "One linear model. The two weighted sums collapse into a single weighted sum.",
    [
      [
        "A model that no longer needs a loss, because the stack measures how wrong it is.",
        "loss",
      ],
      [
        "A model whose step size is chosen by the stack depth.",
        "learning-rate",
      ],
      [
        "A model that has already held out a test set.",
        "splits",
      ],
    ],
  ),
  q(
    "activation",
    2,
    "What is the job of the bend after a unit's weighted sum?",
    "The bend is what stops a stack of layers from collapsing into one straight weighted sum.",
    "To keep the stack from collapsing into one linear model.",
    [
      [
        "To point at the steepest climb of the loss.",
        "gradient",
      ],
      [
        "To copy the answer column into the hidden units.",
        "examples",
      ],
      [
        "To choose the step size for the next update.",
        "learning-rate",
      ],
    ],
  ),
  q(
    "activation",
    3,
    "Training a deep stack still depends on an idea from the first week of the course. Which one, if the weights are to move for a reason?",
    "You still need a loss, because the update follows the slope of how wrong the prediction is.",
    "Loss. The update follows the slope of how wrong the prediction is, all the way back through the bends.",
    [
      [
        "One-hot encoding. Without it a weighted sum cannot train.",
        "one-hot",
      ],
      [
        "The test set. Weights should be updated on held out rows.",
        "splits",
      ],
      [
        "Precision. The stack is trained by counting false alarms only.",
        "precision-recall",
      ],
    ],
  ),
  q(
    "embedding",
    1,
    "When would you rather learn a short list of numbers for each category than use one column per category?",
    "One column per category becomes huge when there are very many names.",
    "When there are so many names that one column per category is enormous.",
    [
      [
        "When the feature is an amount, like temperature.",
        "features",
      ],
      [
        "When you want the step size to replace the weights.",
        "learning-rate",
      ],
      [
        "When you want to stop measuring how wrong the prediction is.",
        "loss",
      ],
    ],
  ),
  q(
    "embedding",
    2,
    "Embeddings are trained, not typed in by hand. What moves those numbers?",
    "The same kind of update as any weight: opposite the slope of the loss.",
    "Gradient steps on the loss. Categories get similar lists when that similarity makes predictions less wrong.",
    [
      [
        "The alphabetical order of the names.",
        "categorical",
      ],
      [
        "A single 1 written into a matching column and then frozen.",
        "one-hot",
      ],
      [
        "The held out test labels, copied in before training.",
        "splits",
      ],
    ],
  ),
  q(
    "embedding",
    3,
    "An embedding for a category is still sitting on top of earlier ideas. If the short lists never move during training, which earlier failure is the first place to look?",
    "If there is no working update, look at whether a loss produces a slope and whether that slope is actually being stepped on.",
    "The update. Either how wrong the prediction is has no slope here, or the step opposite that slope is not reaching these weights.",
    [
      [
        "The city names were never given one column per category, so training is illegal.",
        "one-hot",
      ],
      [
        "Precision was not computed before the first epoch.",
        "precision-recall",
      ],
      [
        "The bias term of the linear model was positive.",
        "linear",
      ],
    ],
  ),
]
