import React, { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import Chatfileupload from './Chatfileupload';
import { PulseLoader } from "react-spinners";
import ContentEditable from "react-contenteditable";
import sanitizeHtml from 'sanitize-html';


dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

import "../assets/css/bootstrap.css";
import "../assets/css/style.css";
import "../assets/fontawesome/css/font-awesome.css";
import { set, get, del, clear, keys } from 'idb-keyval';
import { useLocation } from 'react-router-dom';
import axiosConfig, { BASE_URL, FILE_PATH } from '../axiosConfig';

import emptydata from '../assets/emptydata.png';


const Index = ({ socket }) => {
	const location = useLocation();

	const queryParams = new URLSearchParams(location.search);
	const loggedInid = atob(queryParams.get('userid'));
	const taskId = queryParams.get('taskid');
	//console.log(taskId);

	const [token, setToken] = useState(null);
	const [userName, setUserName] = useState(null);

	const [taskData, settaskData] = useState([]);
	const [taggeduserData, settaggeduserData] = useState([]);
	//console.log(taggeduserData);

	//const [filteredtasks, setFilteredtasks] = useState([]); // filtered list
	const lastMessageGroupRef = useRef(null);
	const chatContainerRef = useRef(null);
	const inputRef = useRef(null);

	const [selectedtask, setselectedtask] = useState('');
	const [senderName, setsenderName] = useState('');


	const [message, setMessage] = useState('');
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [cursorPos, setCursorPos] = useState(0);
	const [usersList, setUserList] = useState([]);
	// const usersList = [
	// { id: 1, username: 'alice' },
	// { id: 2, username: 'bob' },
	// { id: 3, username: 'charlie' },
	// ];

	const [files, setFiles] = useState([]);
	const [filesblank, setfilesblank] = useState(false);
	const [image, setImage] = useState(null);
	const [postMsgLoader, setpostMsgLoader] = useState(false);

	const [page, setPage] = useState(1);
	const [hasMoreMessages, setHasMoreMessages] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const [values, setValues] = useState({
		userId: loggedInid
	})


	const fetchUserInfo = async () => {
		try {
			const response = await axiosConfig.post('/auth/login', values)
			if (response.status == 200) {
				//const token = localStorage.getItem(token)
				//navigate('/')  
				//window.location.href = "/";
				//console.log(response);
				await set('token', response.data.token);
				await set('userName', response.data.name);
				setsenderName(response.data.name)
				handleSelecttask(taskId)
				getallUser()
			}
		} catch (error) {
			//navigate('/')
		}
	}

	useEffect(() => {
		const checkToken = async () => {
			const storedToken = await get('token');
			const storedUserName = await get('userName');

			setToken(storedToken);
			setUserName(storedUserName);

			await fetchUserInfo();
		};

		checkToken();
	}, []);


	const getallUser = async () => {
		try {
			const response = await axiosConfig.get('/chat/getalluser', values)
			if (response.status == 200) {
				//const token = localStorage.getItem(token)
				//navigate('/')  
				//window.location.href = "/";
				//console.log(response);
				const tagsUserData = response.data
					.filter(user => String(user.id) !== String(loggedInid))
					.map(user => ({
						id: user.id,
						username: user.fld_first_name
					}));
				setUserList(tagsUserData);
			}
		} catch (error) {
			//navigate('/')
		}
	}

	const [taskChatData, settaskChatData] = useState([]);

	const handleSelecttask = async (taskId) => {

		setPage(1);
		setHasMoreMessages(true);
		settaskChatData([]); // clear old messages
		setselectedtask(atob(taskId))

		try {
			const encodetaskId = taskId;
			const response = await axiosConfig.get(`/chat/gettaskchat/${encodetaskId}?page=1&limit=10`);
			settaskChatData(response.data);
		} catch (error) {
			console.log(error.message);
		}
	};

	const isEmpty = !taskChatData || Object.keys(taskChatData).length === 0;
	//console.log(userChatData);

	const handleSendMessage = async (e) => {
		setpostMsgLoader(true); // 🟢 Start loading early
		const d = new Date();
		const formattedDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

		if ((message.trim() || files.length)) {
			// const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

			// if (emailRegex.test(message)) {
			// 	alert("Email addresses are not allowed in messages.");
			// 	setpostMsgLoader(false); // 🔴 Stop loading on validation fail
			// 	return;
			// }

			try {
				if (files.length > 0) {
					const formData = new FormData();
					files.forEach((file) => {
						formData.append('files[]', file);
					});

					const response = await axiosConfig.post(`https://apacvault.com/upload_loop_chatapp_file.php`, formData, {
						headers: { 'Content-Type': 'multipart/form-data' }
					});

					// const formData = new FormData();
					// files.forEach((file) => {
					// 	formData.append('files', file);
					// });

					// const response = await axiosConfig.post(`/upload`, formData, {
					// 	headers: { 'Content-Type': 'multipart/form-data' }
					// });

					let filesStr = '';
					//console.log(response.data['files']);

					response.data['files'].forEach((file) => {
						let originalnameFilename = file.originalname;
						if (originalnameFilename === 'image.png') {
							originalnameFilename = `Screenshot_${file.filename}`;
						}
						// if (file.mimetype.startsWith("image/")) {
						// 	filesStr += `<a key={${BASE_URL}/uploads/${file.filename}} href="${BASE_URL}/uploads/${file.filename}" rel="noopener noreferrer" target="_blank"><img src="${BASE_URL}/uploads/${file.filename}" style=" width: 150px" /> </a>||`
						// } else {
						// 	filesStr += `<a key={${BASE_URL}/uploads/${file.filename}} href="${BASE_URL}/uploads/${file.filename}" target="_blank" rel="noopener noreferrer">${originalnameFilename}</a>||`
						// }
						filesStr += `${file.filename}||`
					});

					filesStr = filesStr.replace(/\|\|$/, ''); // Remove last ||


					await socket.emit('messagegroup', {
						message,
						senderName,
						senderId: loggedInid,
						taskId: selectedtask,
						socketID: socket.id,
						messageType: 'User',
						uploadedFile: filesStr,
						tagged_user: taggeduserData,
						timestamp: formattedDate
					});

					setFiles([]);
					setImage(null);
					setfilesblank(true);
				} else {
					await socket.emit('messagegroup', {
						message,
						senderName,
						senderId: loggedInid,
						taskId: selectedtask,
						socketID: socket.id,
						messageType: 'User',
						uploadedFile: null,
						tagged_user: taggeduserData,
						timestamp: formattedDate
					});
				}
				setMessage('');
			} catch (err) {
				console.log("Send error:", err.message);
			}
		}
		setpostMsgLoader(false); // 🔴 Always stop loading after processing
	};


	useEffect(() => {
		socket.on('messagegroupResponse', (data) => {
			//console.log(data.fld_taskid+'==='+selectedtask);

			if (data.task_id == selectedtask) {
				settaskChatData([...taskChatData, data])
			}
		})
	}, [socket, taskChatData]);

	useEffect(() => {
		//console.log(page);

		if (page == 1) {
			lastMessageGroupRef.current?.scrollIntoView({ block: "end" });
		}
	}, [page, taskChatData]);

	useEffect(() => {
		const container = chatContainerRef.current;
		if (!container) return;

		let timeout = null;

		const handleScroll = () => {
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(async () => {
				if (container.scrollTop <= 10 && hasMoreMessages && !isLoadingMore) {
					setIsLoadingMore(true);
					const nextPage = page + 1;

					try {
						const encodetaskId = btoa(selectedtask);
						const response = await axiosConfig.get(`/chat/gettaskchat/${encodetaskId}?page=${nextPage}&limit=10`);

						if (response.data.length > 0) {
							// Prevent duplication
							const newMessages = response.data.filter(
								(newMsg) => !taskChatData.some((existing) => existing.id === newMsg.id)
							);

							const prevScrollHeight = container.scrollHeight;

							settaskChatData((prev) => [...newMessages, ...prev]);
							setPage(nextPage);

							setTimeout(() => {
								const newScrollHeight = container.scrollHeight;

								// ✅ Maintain previous scroll position + small offset
								const scrollOffset = 50; // Scroll down by 50px (tweak as needed)
								container.scrollTop = newScrollHeight - prevScrollHeight + scrollOffset;

							}, 0);
						} else {
							setHasMoreMessages(false);
						}
					} catch (err) {
						console.log("Pagination error:", err.message);
					} finally {
						setIsLoadingMore(false);
					}
				}
			}, 200); // debounce time
		};

		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, [selectedtask, page, hasMoreMessages, isLoadingMore, taskChatData]);


	const handleChange = (e) => {
		const html = sanitizeHtml(e.target.value, {
			allowedTags: ['b', 'i', 'em', 'strong', 'span'],
			allowedAttributes: { span: ['class'] },
		});

		setMessage(html);

		const selection = window.getSelection();
		const anchorNode = selection?.anchorNode;
		if (!anchorNode) return;

		const textBeforeCursor = anchorNode.textContent?.slice(0, selection.anchorOffset) || '';
		const match = textBeforeCursor.match(/@(\w*)$/);

		if (match) {
			const query = match[1].toLowerCase();
			const filtered = usersList.filter(user =>
				user.username.toLowerCase().startsWith(query)
			);
			setSuggestions(filtered);
			setShowSuggestions(true);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	};

	const handleSelectSuggestion = (username, userId) => {
		const selection = window.getSelection();
		if (!selection.rangeCount) return;

		const range = selection.getRangeAt(0);
		const text = range.startContainer.textContent;
		const before = text.slice(0, range.startOffset);
		const match = before.match(/@(\w*)$/);

		if (!match) return;

		const matchStart = range.startOffset - match[0].length;
		range.setStart(range.startContainer, matchStart);
		range.deleteContents();

		// Create mention chip
		const mention = document.createElement('span');
		mention.className = 'e-mention-chip';
		mention.textContent = username;
		mention.contentEditable = 'false';
		mention.setAttribute('data-userid', userId);

		// Insert the mention span
		range.insertNode(mention);

		// Create a space after the chip to separate it from next word
		const space = document.createTextNode('\u00A0'); // non-breaking space
		mention.parentNode.insertBefore(space, mention.nextSibling);

		// Move caret after the space
		const newRange = document.createRange();
		newRange.setStartAfter(space);
		newRange.collapse(true);

		selection.removeAllRanges();
		selection.addRange(newRange);

		// Update message
		setTimeout(() => {
			if (!taggeduserData.includes(userId)) {
				settaggeduserData([...taggeduserData, userId]);
			}

			const newHtml = inputRef.current.innerHTML;
			setMessage(newHtml);
			setSuggestions([]);
			setShowSuggestions(false);
		}, 0);
	};


	const handleBlur = () => {
		setTimeout(() => setShowSuggestions(false), 100);
	};

	const handleKeyDown = (e) => {
		const selection = window.getSelection();
		if (!selection || !selection.anchorNode) return;

		const anchorNode = selection.anchorNode;
		const offset = selection.anchorOffset;

		// Case 1: BACKSPACE
		if (e.key === 'Backspace' && offset === 0) {
			const prevNode = anchorNode.previousSibling;
			if (prevNode?.classList?.contains('e-mention-chip')) {
				e.preventDefault();
				prevNode.remove();
				cleanupEmptyNodes();
				return;
			}
		}

		// Case 2: DELETE
		if (e.key === 'Delete') {
			const nextNode = anchorNode.nextSibling;
			if (nextNode?.classList?.contains('e-mention-chip')) {
				e.preventDefault();
				nextNode.remove();
				cleanupEmptyNodes();
				return;
			}
		}
	};

	// Optional: remove empty <div><br></div> that gets left behind sometimes
	const cleanupEmptyNodes = () => {
		setTimeout(() => {
			const html = inputRef.current.innerHTML;
			setMessage(html);
		}, 0);
	};


	return (
		<>
			<div className="container mx-3">
				<div className="d-flex align-items-center justify-content-between pt-2 pb-1">

					<h6 className="text-center chat-heading">Communication Hub</h6>

					<button onClick={e => handleSelecttask(taskId)} className="btn bt-sm btn-tertiary p-1"><i className="fa fa-refresh" aria-hidden="true"></i></button>

				</div>



				<div className="chatdiv">

					<div className="chat-container" id="chatContainer" ref={chatContainerRef}>

						{isLoadingMore && (
							<div style={{ textAlign: 'center', padding: '10px' }}>
								<PulseLoader color="#e87a36" size={10} />
							</div>
						)}
						{isEmpty ? (
							<div className="no-chat-data">
								<img
									src={emptydata} // Replace with actual image path
									alt="Start a chat"
									className="placeholder-image"
								/>
							</div>
						) : (
							<>
								{taskChatData.map((chatdata) => {
									if (chatdata.id == null) {
										return <b key={chatdata.id || Math.random()}>TEST</b>;
									}

									const isIncoming = loggedInid == chatdata.user_id;
									const fileArray = chatdata.selected_file ? chatdata.selected_file.split('||') : [];
									const formattedDate = dayjs.utc(chatdata.created_at) // treat input as UTC
										.tz('Asia/Kolkata') // convert to IST
										.format('h:mm A | D MMMM, YYYY');

									return (
										<React.Fragment key={chatdata.id}>
											{isIncoming ? (
												<div className="chat-card incoming_msg">

													<div className="chat-avatar">{chatdata.senderShortName}</div>

													<div className="chat-content">

														<strong>{chatdata.sender_fname} {chatdata.sender_lname}</strong><span className="chat-time">{formattedDate}</span>

														<p> <span dangerouslySetInnerHTML={{ __html: chatdata.message }} /></p>
														{fileArray.map((filename, index) => {
															const fileUrl = `${FILE_PATH}/${filename}`;
															const extension = filename.split('.').pop().toLowerCase();
															const displayName = filename.substring(filename.indexOf('_') + 1);
															const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

															return (
																<React.Fragment key={`filebox-${index}`}>
																	{imageExtensions.includes(extension) ? (
																		<a href={fileUrl} target="_blank" rel="noopener noreferrer" className="uploadedImgData">
																			<img src={fileUrl} alt={displayName} style={{ width: '150px' }} />
																		</a>
																	) : (
																		<a href={fileUrl} target="_blank" rel="noopener noreferrer" className="uploadedFilesData">
																			{displayName}
																		</a>
																	)}
																	<br />
																</React.Fragment>
															);
														})}


													</div>

												</div>
											) : (
												<div className="chat-card outgoing_msg">

													<div className="chat-avatar">{chatdata.senderShortName}</div>

													<div className="chat-content">

														<strong>{chatdata.sender_fname} {chatdata.sender_lname}</strong><span className="chat-time">{formattedDate}</span>

														<p> <span dangerouslySetInnerHTML={{ __html: chatdata.message }} /></p>
														{fileArray.map((filename, index) => {
															const fileUrl = `${FILE_PATH}/${filename}`;
															const extension = filename.split('.').pop().toLowerCase();
															const displayName = filename.substring(filename.indexOf('_') + 1);
															const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

															return (
																<React.Fragment key={`filebox-${index}`}>
																	{imageExtensions.includes(extension) ? (
																		<a href={fileUrl} target="_blank" rel="noopener noreferrer" className="uploadedImgData">
																			<img src={fileUrl} alt={displayName} style={{ width: '150px' }} />
																		</a>
																	) : (
																		<a href={fileUrl} target="_blank" rel="noopener noreferrer" className="uploadedFilesData">
																			{displayName}
																		</a>
																	)}
																	<br />
																</React.Fragment>
															);
														})}


													</div>

												</div>
											)}
										</React.Fragment>
									);
								})}
							</>
						)}
						<div ref={lastMessageGroupRef} />

					</div>


					<Chatfileupload
						onFileSelect={setFiles}
						parentselectedFiles={filesblank}
						setfilesblank={setfilesblank}
					/>
					<div className="chat-footer position-relative">

						<form method="POST" id="communicationForm" className="w-100 d-flex align-items-center justify-content-between">

							<div className="w-100 d-flex row">
								<div className="col-md-11 pl-0">

									{showSuggestions && suggestions.length > 0 && (
										<ul
											className="suggestion-dropdown"
										>
											{suggestions.map(user => (
												<li
													key={user.id}
													onMouseDown={(e) => {
														e.preventDefault();
														handleSelectSuggestion(user.username, user.id);
													}}
												>
													@{user.username}
												</li>
											))}
										</ul>
									)}

									{/* <textarea
						className="form-control"
						value={message}
						onChange={handleChange}
						rows={3}
						style={{ width: '100%' }}
						placeholder="Type your message... Use @ to tag"
						/> */}
									<ContentEditable
										innerRef={inputRef}
										html={message}
										onChange={handleChange}
										onKeyDown={handleKeyDown}  // 🟢 Add this
										onBlur={handleBlur}
										className="form-control"
										tagName="div"
										style={{
											minHeight: '100px',
											border: '1px solid #ccc',
											padding: '10px',
											borderRadius: '6px',
											overflowY: 'auto'
										}}
										placeholder="Type a message... use @ to tag"
									/>

								</div>
								<div className="dffc col-md-1 p-0">



									<div className="position-relative">



									</div>



									<div>
										<label className="btn btn-success" htmlFor="file-input">
											<i className="fa fa-paperclip" aria-hidden="true"></i>
										</label>
									</div>


									<button type="button" className="btn btn-primary"
										onClick={handleSendMessage}
									>

										<i className="fa fa-paper-plane" aria-hidden="true"></i>

									</button>
									{postMsgLoader && <PulseLoader
										color="#e87a36"
										loading
										size={10}
									/>}
								</div>

							</div>



						</form>

					</div>

				</div>
			</div>
		</>
	)
}

export default Index