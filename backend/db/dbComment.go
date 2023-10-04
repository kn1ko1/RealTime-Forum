package db

import (
	"fmt"
	"log"
	"realtimeForum/utils"
)

// adds a post to the database
func AddCommentToDatabase(parentPostID int, userID int, body string) error {
	fmt.Println("parentPostID:", parentPostID)
	fmt.Println("userID:", userID)
	fmt.Println("body:", body)
	_, err := Database.Exec("INSERT INTO COMMENTS (PostID, UserID, Body) VALUES (?, ?, ?)", parentPostID, userID, body)
	if err != nil {
		utils.HandleError("Error adding comment to database in AddCommentToDatabase:", err)
		log.Println("Error adding comment to database in AddCommentToDatabase:", err)
	}
	return err
}

// retrieves all posts from database and returns them
func GetCommentsFromDatabase() ([]CommentEntry, error) {
	query := `
        SELECT c.Id, c.PostID, c.UserId, c.Body, c.CreationDate, c.ReactionID,
               COALESCE(cr.Likes, 0) AS Likes, COALESCE(cr.Dislikes, 0) AS Dislikes
        FROM COMMENTS c
        LEFT JOIN COMMENTREACTIONS cr ON c.ReactionID = cr.Id
        ORDER BY c.Id ASC
    `

	rows, err := Database.Query(query)
	if err != nil {
		utils.HandleError("Error querying comments with likes and dislikes from database:", err)
		log.Println("Error querying comments with likes and dislikes from database:", err)
		return nil, err
	}
	defer rows.Close()

	var comments []CommentEntry
	for rows.Next() {
		var comment CommentEntry
		err := rows.Scan(&comment.Id, &comment.ParentPostID, &comment.UserId, &comment.Body, &comment.CreationDate, &comment.ReactionID, &comment.Likes, &comment.Dislikes)
		if err != nil {
			utils.HandleError("Error scanning row from database:", err)
			log.Println("Error scanning row from database:", err)
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}
