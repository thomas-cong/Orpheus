import sys
import cv2
import numpy as np


def get_hu_moments(image_path):
    img = cv2.imread(image_path, 0)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    _, thresh = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        raise ValueError("No contours found in image: " + image_path)
    c = max(contours, key=cv2.contourArea)
    moments = cv2.moments(c)
    huMoments = cv2.HuMoments(moments).flatten()
    huMoments = -np.sign(huMoments) * np.log10(np.abs(huMoments) + 1e-10)
    return huMoments
def preprocess_img_orb(img):
    img = cv2.GaussianBlur(img, (5,5), 0)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    coords = cv2.findNonZero(img)
    x, y, w, h = cv2.boundingRect(coords)
    img = img[y:y+h, x:x+w]
    return img

def orb_similarity(
    img1_path: str,
    img2_path: str,
):
    """
    img1_path: Path to the first image (test).
    img2_path: Path to the second image (reference).
    Calculates the ORB similarity between two images.

    The ORB similarity is a measure of how similar two images are based on their ORB features.
    The similarity is a value between 0 and 1, where 1 means the images are identical, and 0 means the images are completely dissimilar.

    Args:
        img1_path: Path to the first image.
        img2_path: Path to the second image.

    Returns:
        The ORB similarity between the two images.
    """
    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)
    if img1 is None or img2 is None:
        raise ValueError("Could not read one or both images.")
    img1 = preprocess_img_orb(img1)
    img2 = preprocess_img_orb(img2)

    orb = cv2.ORB_create(nfeatures=2000)
    kp1, des1 = orb.detectAndCompute(img1, None)
    kp2, des2 = orb.detectAndCompute(img2, None)
    if des1 is None or des2 is None or len(kp1) == 0 or len(kp2) == 0:
        return 0.0
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(des1, des2)
    # Lowe's ratio test
    # RANSAC filtering for geometric consistency
    if len(matches) >= 4:
        src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1,1,2)
        dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1,1,2)
        M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
        matchesMask = mask.ravel().tolist()
        inlier_matches = [m for m, keep in zip(matches, matchesMask) if keep]
    else:
        inlier_matches = []

    # Draw top 10 inlier matches
    draw_matches = inlier_matches[:20] if len(inlier_matches) > 0 else matches[:20]
    matchesMask_draw = None
    final_img = cv2.drawMatches(
        img1,
        kp1,
        img2,
        kp2,
        draw_matches,
        None,
        matchColor=(0, 0, 255),
        singlePointColor=None,
        matchesMask=matchesMask_draw,
        flags=cv2.DrawMatchesFlags_DEFAULT,
    )
    cv2.imshow("Matches", final_img)
    cv2.waitKey(0)
    # For similarity score, use inlier matches after RANSAC
    num_inliers = len(inlier_matches)
    return num_inliers


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python image_similarity.py <img>", file=sys.stderr)
        sys.exit(1)
    input_img = sys.argv[1]
    reference_img = "server/ReferenceImages/RO_Upscaled_Beta.png"
    try:
        # ORB similarity
        orb_sim = orb_similarity(input_img, reference_img)
        print(f"ORB similarity: {orb_sim:.4f}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(2)
