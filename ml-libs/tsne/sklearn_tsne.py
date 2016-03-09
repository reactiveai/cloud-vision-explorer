from sklearn.manifold.t_sne import TSNE
import pickle
import numpy as np


def pca(mat, n_components_after_pca):
    mat -= np.mean(mat, axis=0)
    cov_x = np.dot(np.transpose(mat), mat)
    [eig_val, eig_vec] = np.linalg.eig(cov_x)

    # sorting the eigen-values in the descending order
    eig_vec = eig_vec[:, eig_val.argsort()[::-1]]

    if n_components_after_pca > len(eig_vec):
        n_components_after_pca = len(eig_vec)

    # truncating the eigen-vectors matrix to keep the most important vectors
    eig_vec = eig_vec[:, :n_components_after_pca]
    mat = np.dot(mat, eig_vec)
    return mat


def tsne(params):
    """
    :param params: dict of parameters
    :return: embedding vectors
    """
    X = params['X']
    n_components_after_pca = params['n_components_after_pca']
    X = pca(X, n_components_after_pca)

    n_components = params['n_components']
    perplexity = params['perplexity']
    early_exaggeration = params['early_exaggeration']
    learning_rate = params['learning_rate']
    n_iter = params['n_iter']
    random_state = params['random_state']
    angle = params['angle']  # theta

    model = TSNE(n_components=n_components,
                 perplexity=perplexity,
                 early_exaggeration=early_exaggeration,
                 learning_rate=learning_rate,
                 n_iter=n_iter,
                 random_state=random_state,
                 angle=angle,
                 verbose=1)
    x_embedding = model.fit_transform(X)
    return x_embedding


if __name__ == "__main__":
    tsne_python_file = open('tsne_data.dat', 'r')
    python_dict = pickle.load(tsne_python_file)
    X = np.array(python_dict['data'])

    params = dict()
    params['X'] = X
    params['n_components'] = 2
    params['n_components_after_pca'] = 40
    params['perplexity'] = 30
    params['early_exaggeration'] = 4.0
    params['learning_rate'] = 1000
    params['n_iter'] = 1000
    params['random_state'] = 0
    params['angle'] = 0.5
    print(tsne(params=params))
